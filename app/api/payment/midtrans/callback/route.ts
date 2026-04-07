import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySignature, mapMidtransStatus } from '@/lib/midtrans';

/**
 * POST /api/payment/midtrans/callback
 * Webhook handler untuk notifikasi pembayaran Midtrans (G3-G6).
 *
 * Midtrans mengirim POST dengan body JSON berisi status transaksi.
 * Handler ini:
 * - Memverifikasi signature (G3)
 * - Idempotency check — skip jika sudah diproses (G4)
 * - Status mapping sesuai G5
 * - Restore stok saat cancel/expire (G6, J2)
 */
export async function POST(request: Request) {
  try {
    const notification = await request.json();

    // G3: Verifikasi signature dari Midtrans
    if (!verifySignature(notification)) {
      console.warn('Midtrans webhook: signature tidak valid');
      return NextResponse.json({ error: 'Signature tidak valid' }, { status: 403 });
    }

    const { order_id, transaction_status, fraud_status } = notification;

    // Cari pesanan berdasarkan midtransOrderId
    const pesanan = await prisma.pesanan.findFirst({
      where: { midtransOrderId: order_id },
      include: {
        detailPesanan: true,
      },
    });

    if (!pesanan) {
      console.warn(`Midtrans webhook: pesanan dengan midtransOrderId="${order_id}" tidak ditemukan`);
      // Return 200 agar Midtrans tidak retry terus
      return NextResponse.json({ message: 'Pesanan tidak ditemukan, skip' });
    }

    // G4: Idempotency — jika status sudah final, skip
    const finalStatuses = ['diproses', 'dikirim', 'selesai', 'dibatalkan'];
    if (finalStatuses.includes(pesanan.statusPesanan)) {
      return NextResponse.json({ message: 'Status sudah diproses, skip' });
    }

    // G5: Mapping status Midtrans → status pesanan (shared helper)
    const mapping = mapMidtransStatus(transaction_status, fraud_status);

    if (mapping.skip) {
      return NextResponse.json({ message: mapping.message });
    }

    // Update dalam transaction — termasuk restore stok jika perlu (G6, J2)
    await prisma.$transaction(async (tx) => {
      await tx.pesanan.update({
        where: { idPesanan: pesanan.idPesanan },
        data: {
          statusPesanan: mapping.statusPesanan!,
          statusPembayaran: mapping.statusPembayaran!,
        },
      });

      // G6, J2: Kembalikan stok jika dibatalkan
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
        ? `Pesanan #${pesanan.idPesanan} dibatalkan oleh Midtrans (${transaction_status})`
        : `Pembayaran pesanan #${pesanan.idPesanan} berhasil via Midtrans`;

      await tx.notifikasiAdmin.create({
        data: {
          tipe,
          pesan,
          idPesanan: pesanan.idPesanan,
        },
      });
    });

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Error handling Midtrans webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
