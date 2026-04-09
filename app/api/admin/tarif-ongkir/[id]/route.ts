import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const tarifOngkirSchema = z.object({
  kotaTujuan: z.string().min(1, 'Kota Tujuan wajib diisi'),
  zona: z.string().min(1, 'Zona wajib diisi'),
  biayaOngkir: z.number().min(0, 'Biaya Ongkir tidak valid'),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const paramsAwaited = await params;
    const idTarif = parseInt(paramsAwaited.id);
    if (isNaN(idTarif)) {
      return NextResponse.json({ error: 'ID Tarif Ongkir tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    
    // Parse numeric fields properly
    if (typeof body.biayaOngkir === 'string') {
      body.biayaOngkir = parseFloat(body.biayaOngkir);
    }
    
    const validatedData = tarifOngkirSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
    }

    const tarifOngkir = await prisma.tarifOngkir.update({
      where: { idTarif },
      data: {
        kotaTujuan: validatedData.data.kotaTujuan,
        zona: validatedData.data.zona,
        biayaOngkir: validatedData.data.biayaOngkir,
      },
    });

    return NextResponse.json({ data: tarifOngkir, message: 'Tarif ongkir berhasil diperbarui' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Tarif ongkir tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui tarif ongkir' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const paramsAwaited = await params;
    const idTarif = parseInt(paramsAwaited.id);
    if (isNaN(idTarif)) {
      return NextResponse.json({ error: 'ID Tarif Ongkir tidak valid' }, { status: 400 });
    }

    await prisma.tarifOngkir.delete({
      where: { idTarif },
    });

    return NextResponse.json({ message: 'Tarif ongkir berhasil dihapus' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Tarif ongkir tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Gagal menghapus tarif ongkir' }, { status: 500 });
  }
}
