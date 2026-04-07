import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { kontakSchema } from '@/lib/validations/kontak';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi input dengan Zod
    const parsed = kontakSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(e => e.message).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { namaLengkap, email, subjek, isiPesan } = parsed.data;

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
