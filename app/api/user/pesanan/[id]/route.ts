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

export async function PUT(
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
    const body = await request.json();
    const { statusPesanan } = body;

    const pesanan = await prisma.pesanan.findUnique({
      where: { idPesanan, idUser: user.idUser },
    });

    if (!pesanan) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (statusPesanan === 'selesai') {
      if (pesanan.statusPesanan !== 'dikirim') {
        return NextResponse.json({ error: 'Pesanan belum dikirim, tidak dapat diselesaikan.' }, { status: 400 });
      }

      const updatedPesanan = await prisma.pesanan.update({
        where: { idPesanan },
        data: { statusPesanan: 'selesai' },
      });

      return NextResponse.json(updatedPesanan);
    }

    return NextResponse.json({ error: 'Operasi tidak diizinkan' }, { status: 400 });
  } catch (error) {
    console.error('Error updating pesanan as user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

