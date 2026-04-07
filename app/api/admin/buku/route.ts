import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile, validateUploadFile } from '@/lib/upload';
import { requireAdmin } from '@/lib/auth';
import { bukuSchema } from '@/lib/validations/buku';
import { getPaginationParams, paginationMeta } from '@/lib/pagination';

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const { page, limit, skip } = getPaginationParams(searchParams);

    const where: any = {};
    if (search) {
      where.OR = [{ judul: { contains: search } }, { pengarang: { contains: search } }];
    }

    const [books, total] = await Promise.all([
      prisma.buku.findMany({
        where,
        orderBy: { tanggalDibuat: 'desc' },
        skip,
        take: limit,
        include: {
          kategoriBuku: true,
        },
      }),
      prisma.buku.count({ where }),
    ]);
    return NextResponse.json({ data: books, pagination: paginationMeta(total, page, limit) });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    const formData = await request.formData();

    const judul = formData.get('judul') as string;
    const pengarang = formData.get('pengarang') as string;
    const penerbit = formData.get('penerbit') as string;
    const tahunTerbit = parseInt(formData.get('tahunTerbit') as string);
    const isbn = formData.get('isbn') as string;
    const stok = parseInt(formData.get('stok') as string);
    const harga = parseFloat(formData.get('harga') as string);
    const sinopsis = formData.get('sinopsis') as string;
    const idKategori = parseInt(formData.get('idKategori') as string);
    const coverFile = formData.get('coverImage') as File | null;
    const coverUrlInput = formData.get('coverUrl') as string;

    // Validasi dengan Zod (B3, B4, B7)
    const parsed = bukuSchema.safeParse({
      judul,
      pengarang,
      penerbit,
      tahunTerbit,
      harga,
      stok,
      idKategori,
      sinopsis: sinopsis || undefined,
      isbn: isbn || undefined,
    });
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    let finalCoverUrl = coverUrlInput || null;

    if (coverFile && coverFile.size > 0) {
      // Validasi file upload (H1, H3, H4)
      const uploadError = validateUploadFile(coverFile);
      if (uploadError) {
        return NextResponse.json({ error: uploadError }, { status: 400 });
      }
      finalCoverUrl = await saveFile(coverFile, 'cover-buku');
    }

    const book = await prisma.buku.create({
      data: {
        judul,
        pengarang,
        penerbit,
        tahunTerbit,
        isbn,
        stok,
        harga,
        sinopsis,
        idKategori,
        coverUrl: finalCoverUrl,
        statusAktif: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
