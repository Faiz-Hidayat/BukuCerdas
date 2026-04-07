import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getPaginationParams, paginationMeta } from '@/lib/pagination';

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const { page, limit, skip } = getPaginationParams(searchParams);

    const where: any = {};
    if (search) {
      where.OR = [{ kodePesanan: { contains: search } }, { user: { namaLengkap: { contains: search } } }];
    }
    if (status && status !== 'all') {
      where.statusPesanan = status;
    }

    const [orders, total] = await Promise.all([
      prisma.pesanan.findMany({
        where,
        orderBy: { tanggalPesan: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { namaLengkap: true },
          },
        },
      }),
      prisma.pesanan.count({ where }),
    ]);
    return NextResponse.json({ data: orders, pagination: paginationMeta(total, page, limit) });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
