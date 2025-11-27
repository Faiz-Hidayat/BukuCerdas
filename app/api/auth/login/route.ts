import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createToken, setTokenCookie } from '@/lib/auth';

// Schema validasi untuk login
const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username atau email harus diisi'),
  kataSandi: z.string().min(1, 'Kata sandi harus diisi'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse dan validasi body request
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Cari user berdasarkan username atau email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.usernameOrEmail },
          { email: validatedData.usernameOrEmail },
        ],
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { sukses: false, pesan: 'Username atau kata sandi salah' },
        { status: 401 }
      );
    }

    // Cek status akun
    if (user.statusAkun !== 'aktif') {
      return NextResponse.json(
        { sukses: false, pesan: 'Akun Anda tidak aktif. Silakan hubungi administrator.' },
        { status: 403 }
      );
    }

    // Verifikasi kata sandi
    const isPasswordValid = await bcrypt.compare(
      validatedData.kataSandi,
      user.kataSandiHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { sukses: false, pesan: 'Username atau kata sandi salah' },
        { status: 401 }
      );
    }

    // Buat JWT token
    const token = await createToken({
      idUser: user.idUser,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Set token ke HTTP-only cookie
    await setTokenCookie(token);

    // Return user data (tanpa kata sandi hash)
    return NextResponse.json(
      {
        sukses: true,
        pesan: 'Login berhasil',
        data: {
          idUser: user.idUser,
          namaLengkap: user.namaLengkap,
          username: user.username,
          email: user.email,
          role: user.role,
          fotoProfilUrl: user.fotoProfilUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle validation error dari Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          sukses: false,
          pesan: 'Data tidak valid',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            pesan: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error login:', error);
    return NextResponse.json(
      { sukses: false, pesan: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
