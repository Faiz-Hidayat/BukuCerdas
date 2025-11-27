import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const idBuku = parseInt(id);
  const idUser = user.idUser;
  const { rating, komentar } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating invalid' }, { status: 400 });
  }

  // Verify purchase again for security
  const purchase = await prisma.detailPesanan.findFirst({
    where: {
      idBuku: idBuku,
      pesanan: {
        idUser: idUser,
        statusPesanan: 'selesai',
      },
    },
  });

  if (!purchase) {
    return NextResponse.json({ error: 'Anda belum membeli buku ini' }, { status: 403 });
  }

  // Check existing review
  const existingReview = await prisma.ulasanBuku.findFirst({
    where: {
      idBuku: idBuku,
      idUser: idUser,
    },
  });

  if (existingReview) {
    return NextResponse.json({ error: 'Anda sudah mengulas buku ini' }, { status: 400 });
  }

  try {
    const review = await prisma.ulasanBuku.create({
      data: {
        idBuku,
        idUser,
        rating,
        komentar,
      },
    });

    // Update book rating
    const aggregations = await prisma.ulasanBuku.aggregate({
      where: { idBuku },
      _avg: { rating: true },
    });

    await prisma.buku.update({
      where: { idBuku },
      data: { rating: aggregations._avg.rating || 0 },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Gagal mengirim ulasan' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idBuku = parseInt(id);

    const reviews = await prisma.ulasanBuku.findMany({
      where: { idBuku },
      include: {
        user: {
          select: {
            namaLengkap: true,
            fotoProfilUrl: true,
          },
        },
      },
      orderBy: { tanggalUlasan: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
