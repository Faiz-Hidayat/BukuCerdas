import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { kategoriSchema } from '@/lib/validations/kategori';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();

    const { id: idParam } = await params;
    const id = parseInt(idParam);
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
        NOT: { idKategori: id },
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'Nama kategori sudah digunakan' }, { status: 409 });
    }

    const category = await prisma.kategoriBuku.update({
      where: { idKategori: id },
      data: {
        namaKategori,
        deskripsi,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Check if category is used by any books
    const booksCount = await prisma.buku.count({
      where: { idKategori: id },
    });

    if (booksCount > 0) {
      return NextResponse.json(
        { error: 'Kategori tidak bisa dihapus karena masih digunakan oleh buku.' },
        { status: 400 },
      );
    }

    await prisma.kategoriBuku.delete({
      where: { idKategori: id },
    });

    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
