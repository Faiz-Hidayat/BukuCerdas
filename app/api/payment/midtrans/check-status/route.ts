import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTransactionStatus, mapMidtransStatus } from '@/lib/midtrans';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/payment/midtrans/check-status
 * Cek status transaksi Midtrans via GET Status API, lalu update DB.
 * Dipakai oleh frontend setelah Snap popup ditutup (onSuccess/onPending/onClose/onError),
 * dan juga oleh tombol "Cek Status Pembayaran" di halaman pesanan-saya.
 *
 * Body: { idPesanan: number }
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { idPesanan } = body;

    if (!idPesanan) {
      return NextResponse.json({ error: 'idPesanan wajib diisi' }, { status: 400 });
    }

    // Cari pesanan + pastikan milik user ini
    const pesanan = await prisma.pesanan.findFirst({
      where: {
        idPesanan: Number(idPesanan),
        idUser: user.idUser,
      },
      include: { detailPesanan: true },
    });

    if (!pesanan) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (!pesanan.midtransOrderId) {
      return NextResponse.json({ error: 'Pesanan ini bukan pembayaran Midtrans' }, { status: 400 });
    }

    // Idempotency — jika sudah final, langsung return status saat ini
    const finalStatuses = ['diproses', 'dikirim', 'selesai', 'dibatalkan'];
    if (finalStatuses.includes(pesanan.statusPesanan)) {
      return NextResponse.json({
        statusPesanan: pesanan.statusPesanan,
        statusPembayaran: pesanan.statusPembayaran,
        message: 'Status sudah final',
        updated: false,
      });
    }

    // Panggil Midtrans GET Status API
    let midtransStatus;
    try {
      midtransStatus = await getTransactionStatus(pesanan.midtransOrderId);
    } catch (err) {
      // 404 = customer belum pilih metode pembayaran di Snap
      console.warn('Midtrans GET Status error:', err);
      return NextResponse.json({
        statusPesanan: pesanan.statusPesanan,
        statusPembayaran: pesanan.statusPembayaran,
        message: 'Belum ada status pembayaran dari Midtrans',
        updated: false,
      });
    }

    // Mapping status
    const mapping = mapMidtransStatus(
      midtransStatus.transaction_status,
      midtransStatus.fraud_status
    );

    if (mapping.skip) {
      return NextResponse.json({
        statusPesanan: pesanan.statusPesanan,
        statusPembayaran: pesanan.statusPembayaran,
        message: mapping.message,
        updated: false,
      });
    }

    // Update DB dalam transaction
    await prisma.$transaction(async (tx) => {
      await tx.pesanan.update({
        where: { idPesanan: pesanan.idPesanan },
        data: {
          statusPesanan: mapping.statusPesanan!,
          statusPembayaran: mapping.statusPembayaran!,
        },
      });

      // Kembalikan stok jika dibatalkan
      if (mapping.shouldRestoreStock) {
        for (const detail of pesanan.detailPesanan) {
          await tx.buku.update({
            where: { idBuku: detail.idBuku },
            data: { stok: { increment: detail.jumlah } },
          });
        }
      }

      // Notifikasi admin
      const tipe = mapping.shouldRestoreStock ? 'pesanan_baru' : 'pembayaran_baru';
      const pesan = mapping.shouldRestoreStock
        ? `Pesanan #${pesanan.idPesanan} dibatalkan oleh Midtrans (${midtransStatus.transaction_status})`
        : `Pembayaran pesanan #${pesanan.idPesanan} berhasil via Midtrans`;

      await tx.notifikasiAdmin.create({
        data: {
          tipe,
          pesan,
          idPesanan: pesanan.idPesanan,
        },
      });
    });

    return NextResponse.json({
      statusPesanan: mapping.statusPesanan,
      statusPembayaran: mapping.statusPembayaran,
      message: mapping.message,
      updated: true,
    });
  } catch (error) {
    console.error('Error checking Midtrans status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
