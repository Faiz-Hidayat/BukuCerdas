import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaginationParams, paginationMeta } from '@/lib/pagination';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort'); // 'terbaru', 'terlaris', 'termurah'
  const { page, limit, skip } = getPaginationParams(searchParams);

  const where: any = {
    statusAktif: true,
  };

  if (search) {
    where.OR = [
      { judul: { contains: search } },
      { pengarang: { contains: search } },
    ];
  }

  if (category) {
    where.idKategori = parseInt(category);
  }

  let orderBy: any = { tanggalDibuat: 'desc' };

  if (sort === 'termurah') {
    orderBy = { harga: 'asc' };
  } else if (sort === 'terlaris') {
     orderBy = { detailPesanan: { _count: 'desc' } };
  }

  try {
    const [books, total] = await Promise.all([
      prisma.buku.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          kategoriBuku: true,
          _count: {
            select: { ulasanBuku: true },
          },
          ulasanBuku: {
            select: { rating: true },
          },
        },
      }),
      prisma.buku.count({ where }),
    ]);

    // Calculate average rating
    const booksWithRating = books.map((book) => {
      const totalRating = book.ulasanBuku.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = book.ulasanBuku.length > 0 ? totalRating / book.ulasanBuku.length : 0;
      const { ulasanBuku, ...rest } = book;
      return { ...rest, rating: avgRating };
    });

    return NextResponse.json({ data: booksWithRating, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
