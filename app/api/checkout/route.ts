import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validations/checkout';

/**
 * POST /api/checkout
 * Membuat pesanan baru dari keranjang user.
 * Semua operasi dalam 1 database transaction (rule J1).
 * - Validasi stok final (D1)
 * - Kurangi stok (D2) dalam transaction (D3)
 * - Snapshot harga dari DB (D5, J4)
 * - Hitung subtotal server-side (D6, D7)
 * - Kosongkan cart (D8)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin tidak bisa melakukan pembelian (rule A6)
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admin tidak bisa melakukan pembelian' }, { status: 403 });
    }

    const body = await request.json();

    // Validasi input dengan Zod
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { idAlamat, metodePembayaran } = parsed.data;

    // Semua operasi checkout dalam 1 transaction (J1, D3)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil keranjang + items
      const keranjang = await tx.keranjang.findUnique({
        where: { idUser: user.idUser },
        include: {
          itemKeranjang: {
            include: { buku: true },
          },
        },
      });

      if (!keranjang || keranjang.itemKeranjang.length === 0) {
        throw new Error('CART_EMPTY');
      }

      // 2. Validasi stok final (D1) — re-check setiap buku dalam transaction
      const stokErrors: string[] = [];
      for (const item of keranjang.itemKeranjang) {
        const buku = await tx.buku.findUnique({
          where: { idBuku: item.idBuku },
        });
        if (!buku || !buku.statusAktif) {
          stokErrors.push(`"${item.buku.judul}" sudah tidak tersedia`);
        } else if (buku.stok < item.jumlah) {
          stokErrors.push(`Stok "${buku.judul}" tersisa ${buku.stok}, Anda memesan ${item.jumlah}`);
        }
      }
      if (stokErrors.length > 0) {
        throw new Error('STOCK_ERROR:' + JSON.stringify(stokErrors));
      }

      // 3. Validasi alamat milik user
      const alamat = await tx.alamatUser.findUnique({
        where: { idAlamat: Number(idAlamat) },
      });
      if (!alamat || alamat.idUser !== user.idUser) {
        throw new Error('INVALID_ADDRESS');
      }

      // 4. Hitung harga dari database (J4, D5, D6)
      let subtotal = 0;
      const detailItems = keranjang.itemKeranjang.map((item) => {
        const hargaSatuan = Number(item.buku.harga);
        const itemSubtotal = hargaSatuan * item.jumlah;
        subtotal += itemSubtotal;
        return {
          idBuku: item.idBuku,
          jumlah: item.jumlah,
          hargaSatuan,
          subtotal: itemSubtotal,
        };
      });

      // 5. Hitung ongkir
      let ongkir = 20000;
      const tarif = await tx.tarifOngkir.findFirst({
        where: {
          kotaTujuan: { contains: alamat.kota },
        },
      });
      if (tarif) {
        ongkir = Number(tarif.biayaOngkir);
      }

      // 6. Hitung pajak
      const pengaturan = await tx.pengaturanToko.findFirst();
      const pajakPersen = pengaturan ? Number(pengaturan.pajakPersen) : 11;
      const pajakNominal = (subtotal * pajakPersen) / 100;
      const totalBayar = subtotal + ongkir + pajakNominal;

      // 7. Tentukan status sesuai metode pembayaran
      let statusPembayaran: 'belum_dibayar' | 'menunggu_konfirmasi' = 'belum_dibayar';
      let statusPesanan: 'diproses' | 'menunggu_pembayaran' = 'menunggu_pembayaran';

      if (metodePembayaran === 'cod') {
        statusPembayaran = 'belum_dibayar';
        statusPesanan = 'diproses';
      } else {
        statusPembayaran = 'belum_dibayar';
        statusPesanan = 'menunggu_pembayaran';
      }

      // 8. Generate kode pesanan unik (D9)
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      const kodePesanan = `INV-${date}-${random}`;

      // G1: Generate midtransOrderId untuk metode ewallet/qris
      const midtransOrderId =
        metodePembayaran === 'ewallet' || metodePembayaran === 'qris' ? `BC-INV-${date}-${random}-${Date.now()}` : null;

      // 9. Snapshot alamat (agar tidak berubah jika alamat diedit)
      const alamatSnapshot = JSON.stringify({
        namaPenerima: alamat.namaPenerima,
        nomorTelepon: alamat.nomorTelepon,
        alamatLengkap: alamat.alamatLengkap,
        kota: alamat.kota,
        provinsi: alamat.provinsi,
        kodePos: alamat.kodePos,
      });

      // 10. Buat pesanan (D7 — total dihitung server)
      const pesanan = await tx.pesanan.create({
        data: {
          kodePesanan,
          idUser: user.idUser,
          idAlamat: alamat.idAlamat,
          metodePembayaran,
          statusPembayaran,
          statusPesanan,
          subtotal,
          ongkir,
          pajakPersen,
          pajakNominal,
          totalBayar,
          alamatSnapshot,
          midtransOrderId,
          detailPesanan: {
            create: detailItems,
          },
        },
      });

      // 11. Kurangi stok (D2) — dalam transaction yang sama (D3)
      for (const item of keranjang.itemKeranjang) {
        await tx.buku.update({
          where: { idBuku: item.idBuku },
          data: { stok: { decrement: item.jumlah } },
        });
      }

      // 12. Kosongkan cart (D8)
      await tx.itemKeranjang.deleteMany({
        where: { idKeranjang: keranjang.idKeranjang },
      });

      return pesanan;
    });

    return NextResponse.json({
      message: 'Pesanan berhasil dibuat',
      idPesanan: result.idPesanan,
      metodePembayaran: result.metodePembayaran,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'CART_EMPTY') {
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 });
    }
    if (message.startsWith('STOCK_ERROR:')) {
      const details = JSON.parse(message.replace('STOCK_ERROR:', ''));
      return NextResponse.json({ error: 'Stok tidak mencukupi', details }, { status: 400 });
    }
    if (message === 'INVALID_ADDRESS') {
      return NextResponse.json({ error: 'Alamat tidak valid' }, { status: 400 });
    }

    console.error('Error checkout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
