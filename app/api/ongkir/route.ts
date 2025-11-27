import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { kota } = await request.json();
    
    if (!kota) {
      return NextResponse.json({ ongkir: 20000 }); // Default
    }

    const tarif = await prisma.tarifOngkir.findFirst({
      where: {
        kotaTujuan: {
          contains: kota,
        },
      },
    });

    if (tarif) {
      return NextResponse.json({ ongkir: Number(tarif.biayaOngkir) });
    }

    return NextResponse.json({ ongkir: 20000 }); // Default
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
