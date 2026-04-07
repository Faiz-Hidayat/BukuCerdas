import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getPaginationParams, paginationMeta } from '@/lib/pagination';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { idUser: user.idUser };
    if (status) {
      where.statusPesanan = status;
    }

    // Hitung jumlah per status untuk badge tabs
    const counts = searchParams.get('counts') === '1';

    const [pesanan, total] = await Promise.all([
      prisma.pesanan.findMany({
        where,
        orderBy: { tanggalPesan: 'desc' },
        skip,
        take: limit,
        include: {
          detailPesanan: {
            include: {
              buku: true,
            },
          },
        },
      }),
      prisma.pesanan.count({ where }),
    ]);

    const result: Record<string, unknown> = {
      data: pesanan,
      pagination: paginationMeta(total, page, limit),
    };

    if (counts) {
      const statusCounts = await prisma.pesanan.groupBy({
        by: ['statusPesanan'],
        where: { idUser: user.idUser },
        _count: { statusPesanan: true },
      });
      const countMap: Record<string, number> = {};
      statusCounts.forEach((s) => {
        countMap[s.statusPesanan] = s._count.statusPesanan;
      });
      result.statusCounts = countMap;
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
