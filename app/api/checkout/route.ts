import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idAlamat, metodePembayaran } = await request.json();

    if (!idAlamat || !metodePembayaran) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Ambil keranjang user
    const keranjang = await prisma.keranjang.findUnique({
      where: { idUser: user.idUser },
      include: {
        itemKeranjang: {
          include: {
            buku: true,
          },
        },
      },
    });

    if (!keranjang || keranjang.itemKeranjang.length === 0) {
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 });
    }

    // 2. Ambil alamat
    const alamat = await prisma.alamatUser.findUnique({
      where: { idAlamat: Number(idAlamat) },
    });

    if (!alamat) {
      return NextResponse.json({ error: 'Alamat tidak ditemukan' }, { status: 404 });
    }

    // 3. Hitung subtotal
    let subtotal = 0;
    for (const item of keranjang.itemKeranjang) {
      subtotal += Number(item.buku.harga) * item.jumlah;
    }

    // 4. Hitung ongkir
    // Cari tarif ongkir berdasarkan kota
    let ongkir = 20000; // Default ongkir
    const tarif = await prisma.tarifOngkir.findFirst({
      where: {
        kotaTujuan: {
          contains: alamat.kota, // Simple matching
        },
      },
    });

    if (tarif) {
      ongkir = Number(tarif.biayaOngkir);
    }

    // 5. Hitung pajak
    const pengaturan = await prisma.pengaturanToko.findFirst();
    const pajakPersen = pengaturan ? Number(pengaturan.pajakPersen) : 11; // Default 11%
    const pajakNominal = (subtotal * pajakPersen) / 100;

    const totalBayar = subtotal + ongkir + pajakNominal;

    // 6. Tentukan status
    let statusPembayaran: 'belum_dibayar' | 'menunggu_konfirmasi' = 'belum_dibayar';
    let statusPesanan: 'diproses' | 'menunggu_konfirmasi' = 'menunggu_konfirmasi';

    if (metodePembayaran === 'cod') {
      statusPembayaran = 'belum_dibayar';
      statusPesanan = 'diproses';
    } else {
      statusPembayaran = 'belum_dibayar'; // User needs to upload proof
      statusPesanan = 'menunggu_konfirmasi';
    }

    // 7. Buat Pesanan
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const kodePesanan = `INV-${date}-${random}`;

    const pesanan = await prisma.pesanan.create({
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
        detailPesanan: {
          create: keranjang.itemKeranjang.map((item) => ({
            idBuku: item.idBuku,
            jumlah: item.jumlah,
            hargaSatuan: item.buku.harga,
            subtotal: Number(item.buku.harga) * item.jumlah,
          })),
        },
      },
    });

    // 8. Kosongkan keranjang
    await prisma.itemKeranjang.deleteMany({
      where: { idKeranjang: keranjang.idKeranjang },
    });

    // 9. Kurangi stok buku
    for (const item of keranjang.itemKeranjang) {
      await prisma.buku.update({
        where: { idBuku: item.idBuku },
        data: { stok: { decrement: item.jumlah } },
      });
    }

    return NextResponse.json({ message: 'Pesanan berhasil dibuat', idPesanan: pesanan.idPesanan });
  } catch (error) {
    console.error('Error checkout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
