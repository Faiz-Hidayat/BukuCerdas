import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idPesanan = parseInt(id);

    const pesanan = await prisma.pesanan.findUnique({
      where: { idPesanan, idUser: user.idUser },
      include: {
        detailPesanan: {
          include: {
            buku: true,
          },
        },
        alamatUser: true,
      },
    });

    if (!pesanan) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(pesanan);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
