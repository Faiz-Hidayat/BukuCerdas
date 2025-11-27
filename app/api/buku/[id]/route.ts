import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idBuku = parseInt(id);
    const book = await prisma.buku.findUnique({
      where: { idBuku },
      include: {
        kategoriBuku: true,
        ulasanBuku: {
          include: {
            user: {
              select: {
                namaLengkap: true,
                fotoProfilUrl: true,
              },
            },
          },
          orderBy: { tanggalUlasan: 'desc' },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 });
    }

    // Calculate rating
    const totalRating = book.ulasanBuku.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = book.ulasanBuku.length > 0 ? totalRating / book.ulasanBuku.length : 0;

    return NextResponse.json({ ...book, rating: avgRating });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
