import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { tanggalDaftar: 'desc' },
      select: {
        idUser: true,
        namaLengkap: true,
        username: true,
        email: true,
        role: true,
        fotoProfilUrl: true,
        tanggalDaftar: true,
        statusAkun: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
