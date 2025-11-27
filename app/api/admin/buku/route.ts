import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile } from '@/lib/upload';

export async function GET() {
  try {
    const books = await prisma.buku.findMany({
      where: { statusAktif: true }, // Or show all? Admin usually wants to see all.
      // Let's show all but maybe filter by status in UI.
      // Actually, soft delete usually means we keep it but mark as inactive.
      // The prompt says "DELETE (soft-delete via status_aktif)".
      // So GET should probably return all, or maybe just active ones by default?
      // Admin needs to see inactive ones to restore them or edit them.
      // I'll return all.
      orderBy: { tanggalDibuat: 'desc' },
      include: {
        kategoriBuku: true,
      },
    });
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    if (!judul || !pengarang || !harga || !idKategori) {
      return NextResponse.json({ error: 'Data wajib belum lengkap' }, { status: 400 });
    }

    let finalCoverUrl = coverUrlInput || null;

    if (coverFile && coverFile.size > 0) {
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
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
