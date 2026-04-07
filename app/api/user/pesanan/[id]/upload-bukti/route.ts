import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { saveFile, validateUploadFile, deleteOldFile } from '@/lib/upload';

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

    // Ambil pesanan dan cek kepemilikan
    const pesanan = await prisma.pesanan.findUnique({
      where: { idPesanan },
    });

    if (!pesanan) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (pesanan.idUser !== user.idUser) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // F4: Hanya bisa upload jika status = menunggu_pembayaran atau menunggu_verifikasi
    const allowedStatuses = ['menunggu_pembayaran', 'menunggu_verifikasi'];
    if (!allowedStatuses.includes(pesanan.statusPesanan)) {
      return NextResponse.json({
        error: `Upload bukti tidak diizinkan untuk pesanan dengan status "${pesanan.statusPesanan}"`
      }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('buktiPembayaran') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'File wajib diupload' }, { status: 400 });
    }

    // Validasi file upload (H1, H3, H4)
    const uploadError = validateUploadFile(file);
    if (uploadError) {
      return NextResponse.json({ error: uploadError }, { status: 400 });
    }

    // H6: Hapus file bukti lama jika ada
    await deleteOldFile(pesanan.buktiPembayaranUrl);

    const url = await saveFile(file, 'bukti-pembayaran');

    // F5: Setelah upload, status berubah ke menunggu_verifikasi
    await prisma.pesanan.update({
      where: { idPesanan, idUser: user.idUser },
      data: {
        buktiPembayaranUrl: url,
        statusPembayaran: 'menunggu_konfirmasi',
        statusPesanan: 'menunggu_verifikasi',
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
