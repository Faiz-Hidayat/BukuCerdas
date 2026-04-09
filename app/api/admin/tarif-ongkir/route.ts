import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getPaginationParams, paginationMeta } from '@/lib/pagination';
import { z } from 'zod';

const tarifOngkirSchema = z.object({
  kotaTujuan: z.string().min(1, 'Kota Tujuan wajib diisi'),
  zona: z.string().min(1, 'Zona wajib diisi'),
  biayaOngkir: z.number().min(0, 'Biaya Ongkir tidak valid'),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const { page, limit, skip } = getPaginationParams(searchParams);

    const where: any = {};
    if (search) {
      where.kotaTujuan = { contains: search };
    }

    const [tarifOngkir, total] = await Promise.all([
      prisma.tarifOngkir.findMany({
        where,
        orderBy: { kotaTujuan: 'asc' },
        skip,
        take: limit,
      }),
      prisma.tarifOngkir.count({ where }),
    ]);

    return NextResponse.json({
      data: tarifOngkir,
      meta: paginationMeta(total, page, limit),
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal mengambil data tarif ongkir' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    
    // Parse numeric fields properly
    if (typeof body.biayaOngkir === 'string') {
      body.biayaOngkir = parseFloat(body.biayaOngkir);
    }
    
    const validatedData = tarifOngkirSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
    }

    const tarifOngkir = await prisma.tarifOngkir.create({
      data: {
        kotaTujuan: validatedData.data.kotaTujuan,
        zona: validatedData.data.zona,
        biayaOngkir: validatedData.data.biayaOngkir,
      },
    });

    return NextResponse.json({ data: tarifOngkir, message: 'Tarif ongkir berhasil ditambahkan' }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal menambahkan tarif ongkir' }, { status: 500 });
  }
}
