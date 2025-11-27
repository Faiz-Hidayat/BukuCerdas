import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createToken, setTokenCookie } from '@/lib/auth';

// Schema validasi untuk registrasi
const registerSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore'),
  email: z.string().email('Format email tidak valid'),
  kataSandi: z.string().min(8, 'Kata sandi minimal 8 karakter'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse dan validasi body request
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Cek apakah username sudah digunakan
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { sukses: false, pesan: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { sukses: false, pesan: 'Email sudah digunakan' },
        { status: 400 }
      );
    }

    // Hash kata sandi menggunakan bcrypt (10 rounds)
    const kataSandiHash = await bcrypt.hash(validatedData.kataSandi, 10);

    // Buat user baru dengan role default "user"
    const newUser = await prisma.user.create({
      data: {
        namaLengkap: validatedData.namaLengkap,
        username: validatedData.username,
        email: validatedData.email,
        kataSandiHash,
        role: 'user', // Role default untuk registrasi adalah "user"
        statusAkun: 'aktif',
      },
      select: {
        idUser: true,
        namaLengkap: true,
        username: true,
        email: true,
        role: true,
        tanggalDaftar: true,
        // PENTING: Jangan return kataSandiHash untuk keamanan
      },
    });

    // Buat JWT token
    const token = await createToken({
      idUser: newUser.idUser,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    // Set token ke HTTP-only cookie
    await setTokenCookie(token);

    return NextResponse.json(
      {
        sukses: true,
        pesan: 'Registrasi berhasil',
        data: newUser,
      },
      { status: 201 }
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

    console.error('Error registrasi:', error);
    return NextResponse.json(
      { sukses: false, pesan: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
