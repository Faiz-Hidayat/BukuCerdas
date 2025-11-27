import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { namaLengkap, email, subjek, isiPesan } = await request.json();

    if (!namaLengkap || !email || !subjek || !isiPesan) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    await prisma.pesanKontak.create({
      data: {
        namaLengkap,
        email,
        subjek,
        isiPesan,
      },
    });

    return NextResponse.json({ message: 'Pesan berhasil dikirim' });
  } catch (error) {
    console.error('Error sending contact message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
