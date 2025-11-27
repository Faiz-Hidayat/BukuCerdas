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
    const file = formData.get('buktiPembayaran') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'File wajib diupload' }, { status: 400 });
    }

    const url = await saveFile(file, 'bukti-pembayaran');

    await prisma.pesanan.update({
      where: { idPesanan, idUser: user.idUser },
      data: {
        buktiPembayaranUrl: url,
        statusPembayaran: 'menunggu_konfirmasi',
        statusPesanan: 'menunggu_konfirmasi',
      },
    });

    // Create notification for admin
    await prisma.notifikasiAdmin.create({
      data: {
        tipe: 'pembayaran_baru',
        pesan: `Pembayaran baru untuk pesanan #${idPesanan}`,
        idPesanan,
      },
    });

    return NextResponse.json({ message: 'Bukti pembayaran berhasil diupload' });
  } catch (error) {
    console.error('Error uploading proof', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
