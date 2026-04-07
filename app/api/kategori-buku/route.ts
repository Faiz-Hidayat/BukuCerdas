import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const kategori = await prisma.kategoriBuku.findMany({
      orderBy: { namaKategori: 'asc' },
    });
    return NextResponse.json(kategori);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
