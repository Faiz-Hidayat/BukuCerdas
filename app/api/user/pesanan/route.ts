import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pesanan = await prisma.pesanan.findMany({
      where: { idUser: user.idUser },
      orderBy: { tanggalPesan: 'desc' },
      include: {
        detailPesanan: {
          include: {
            buku: true,
          },
        },
      },
    });

    return NextResponse.json(pesanan);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
