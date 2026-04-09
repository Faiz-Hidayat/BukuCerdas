import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createSnapTransaction, getClientKey } from '@/lib/midtrans';

/**
 * POST /api/payment/midtrans
 * Generate Midtrans Snap token untuk pesanan (G2).
 * Body: { idPesanan: number }
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idPesanan } = await request.json();
    if (!idPesanan) {
      return NextResponse.json({ error: 'idPesanan wajib diisi' }, { status: 400 });
    }

    // Ambil pesanan + detail
    const pesanan = await prisma.pesanan.findUnique({
      where: { idPesanan: Number(idPesanan) },
      include: {
        detailPesanan: {
          include: { buku: true },
        },
        user: true,
      },
    });

    if (!pesanan) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    // Validasi kepemilikan
    if (pesanan.idUser !== user.idUser) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // G2: Hanya untuk metode midtrans-compatible dan status menunggu_pembayaran
    if (pesanan.metodePembayaran !== 'midtrans') {
      return NextResponse.json({ error: 'Metode pembayaran tidak mendukung Midtrans' }, { status: 400 });
    }

    if (pesanan.statusPesanan !== 'menunggu_pembayaran') {
      return NextResponse.json({ error: 'Pesanan tidak dalam status menunggu pembayaran' }, { status: 400 });
    }

    // Generate midtrans order ID unik
    const midtransOrderId = pesanan.midtransOrderId || `BC-${pesanan.kodePesanan}-${Date.now()}`;

    // Simpan midtrans order ID jika belum ada
    if (!pesanan.midtransOrderId) {
      await prisma.pesanan.update({
        where: { idPesanan: pesanan.idPesanan },
        data: { midtransOrderId },
      });
    }

    // Item details untuk Midtrans
    const items = pesanan.detailPesanan.map((d) => ({
      id: `BUKU-${d.idBuku}`,
      name: d.buku.judul.substring(0, 50), // Midtrans max 50 karakter
      price: Number(d.hargaSatuan),
      quantity: d.jumlah,
    }));

    // Tambahkan ongkir & pajak sebagai item
    if (Number(pesanan.ongkir) > 0) {
      items.push({
        id: 'ONGKIR',
        name: 'Ongkos Kirim',
        price: Number(pesanan.ongkir),
        quantity: 1,
      });
    }
    if (Number(pesanan.pajakNominal) > 0) {
      items.push({
        id: 'PAJAK',
        name: `Pajak (${pesanan.pajakPersen}%)`,
        price: Number(pesanan.pajakNominal),
        quantity: 1,
      });
    }

    const { snapToken } = await createSnapTransaction({
      orderId: midtransOrderId,
      amount: Number(pesanan.totalBayar),
      customerName: pesanan.user.namaLengkap,
      customerEmail: pesanan.user.email,
      items,
    });

    return NextResponse.json({
      snapToken,
      clientKey: getClientKey(),
    });
  } catch (error) {
    console.error('Error generating snap token:', error);
    return NextResponse.json({ error: 'Gagal membuat token pembayaran' }, { status: 500 });
  }
}
