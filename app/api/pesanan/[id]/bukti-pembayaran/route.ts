import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { saveFile } from '@/lib/upload';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idPesanan = parseInt(id);

    const formData = await request.formData();
    const file = formData.get('buktiPembayaran') as File;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validasi pesanan milik user
    const pesanan = await prisma.pesanan.findUnique({
      where: { idPesanan },
    });

    if (!pesanan) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (pesanan.idUser !== user.idUser) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Upload file
    const buktiPembayaranUrl = await saveFile(file, 'bukti-pembayaran');

    // Update pesanan
    await prisma.pesanan.update({
      where: { idPesanan },
      data: {
        buktiPembayaranUrl,
        statusPembayaran: 'menunggu_konfirmasi',
        statusPesanan: 'menunggu_konfirmasi',
      },
    });

    // Buat notifikasi admin
    await prisma.notifikasiAdmin.create({
      data: {
        tipe: 'pembayaran_baru',
        pesan: `Pembayaran baru untuk pesanan #${pesanan.kodePesanan}`,
        idPesanan: pesanan.idPesanan,
      },
    });

    return NextResponse.json({ message: 'Bukti pembayaran berhasil diupload', url: buktiPembayaranUrl });
  } catch (error) {
    console.error('Error uploading proof:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
