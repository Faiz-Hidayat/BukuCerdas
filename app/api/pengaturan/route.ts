import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/pengaturan
 * Endpoint publik (tanpa auth) untuk mengambil pengaturan toko yang diperlukan user.
 * Hanya mengembalikan data publik: pajak, metode pembayaran aktif.
 * Tidak mengekspos info sensitif seperti nomor rekening detail.
 */
export async function GET() {
  try {
    const settings = await prisma.pengaturanToko.findFirst();

    if (!settings) {
      return NextResponse.json({
        pajakPersen: 11,
        aktifCOD: true,
        aktifTransfer: false,
        aktifEwallet: false,
        aktifQRIS: false,
      });
    }

    // Hanya kembalikan informasi publik yang dibutuhkan checkout & detail pesanan
    return NextResponse.json({
      pajakPersen: settings.pajakPersen,
      aktifCOD: settings.aktifCOD,
      aktifTransfer: settings.aktifTransfer,
      aktifEwallet: settings.aktifEwallet,
      aktifQRIS: settings.aktifQRIS,
      // Info pembayaran untuk halaman detail pesanan
      nomorRekening: settings.aktifTransfer ? settings.nomorRekening : null,
      nomorEwallet: settings.aktifEwallet ? settings.nomorEwallet : null,
      qrisUrl: settings.aktifQRIS ? settings.qrisUrl : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
