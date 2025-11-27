import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * API untuk mendapatkan informasi user yang sedang login
 * Mengambil data dari JWT token di cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Ambil user dari JWT token di cookie
    const currentUser = await getCurrentUser();

    // Jika tidak ada token atau token tidak valid
    if (!currentUser) {
      return NextResponse.json(
        { sukses: false, pesan: 'Anda belum login' },
        { status: 401 }
      );
    }

    // Ambil data lengkap user dari database
    // (untuk memastikan data terbaru dan validasi user masih ada)
    const user = await prisma.user.findUnique({
      where: { idUser: currentUser.idUser },
      select: {
        idUser: true,
        namaLengkap: true,
        username: true,
        email: true,
        role: true,
        fotoProfilUrl: true,
        nomorTelepon: true,
        tanggalDaftar: true,
        statusAkun: true,
        // PENTING: Jangan return kataSandiHash
      },
    });

    // Jika user tidak ditemukan di database (mungkin sudah dihapus)
    if (!user) {
      return NextResponse.json(
        { sukses: false, pesan: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek status akun
    if (user.statusAkun !== 'aktif') {
      return NextResponse.json(
        { sukses: false, pesan: 'Akun Anda tidak aktif' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        sukses: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error mendapatkan user:', error);
    return NextResponse.json(
      { sukses: false, pesan: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    );
  }
}
