import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile } from '@/lib/upload';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const book = await prisma.buku.findUnique({
      where: { idBuku: id },
      include: { kategoriBuku: true },
    });

    if (!book) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
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
    const statusAktif = formData.get('statusAktif') === 'true';
    
    const coverFile = formData.get('coverImage') as File | null;
    const coverUrlInput = formData.get('coverUrl') as string;

    const dataToUpdate: any = {
      judul,
      pengarang,
      penerbit,
      tahunTerbit,
      isbn,
      stok,
      harga,
      sinopsis,
      idKategori,
      statusAktif,
    };

    if (coverFile && coverFile.size > 0) {
      dataToUpdate.coverUrl = await saveFile(coverFile, 'cover-buku');
    } else if (coverUrlInput !== undefined) {
      // Only update if explicitly provided (even if empty string to clear it, though usually we keep old if not changed)
      // If user wants to keep existing, they might not send anything or send the existing URL.
      // If the form sends the existing URL in coverUrlInput, we use it.
      dataToUpdate.coverUrl = coverUrlInput;
    }

    const book = await prisma.buku.update({
      where: { idBuku: id },
      data: dataToUpdate,
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Soft delete
    await prisma.buku.update({
      where: { idBuku: id },
      data: { statusAktif: false },
    });

    return NextResponse.json({ message: 'Buku berhasil dinonaktifkan' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
