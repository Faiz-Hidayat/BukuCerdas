import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { kategoriSchema } from '@/lib/validations/kategori';
import { getPaginationParams, paginationMeta } from '@/lib/pagination';

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const { page, limit, skip } = getPaginationParams(searchParams);

    const where: any = {};
    if (search) {
      where.namaKategori = { contains: search };
    }

    const [categories, total] = await Promise.all([
      prisma.kategoriBuku.findMany({
        where,
        orderBy: { namaKategori: 'asc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { buku: true },
          },
        },
      }),
      prisma.kategoriBuku.count({ where }),
    ]);
    return NextResponse.json({ data: categories, pagination: paginationMeta(total, page, limit) });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();

    // Validasi dengan Zod
    const parsed = kategoriSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { namaKategori, deskripsi } = parsed.data;

    // B5: Nama kategori harus unik (MySQL collation sudah case-insensitive)
    const existing = await prisma.kategoriBuku.findFirst({
      where: {
        namaKategori: namaKategori,
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'Nama kategori sudah digunakan' }, { status: 409 });
    }

    const category = await prisma.kategoriBuku.create({
      data: {
        namaKategori,
        deskripsi,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
