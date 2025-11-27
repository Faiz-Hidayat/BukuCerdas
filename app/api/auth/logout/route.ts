import { NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

/**
 * API untuk logout user
 * Menghapus JWT token dari cookie
 */
export async function POST() {
  try {
    // Hapus token dari cookie
    await removeTokenCookie();

    return NextResponse.json(
      {
        sukses: true,
        pesan: 'Logout berhasil',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error logout:', error);
    return NextResponse.json(
      { sukses: false, pesan: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
}
