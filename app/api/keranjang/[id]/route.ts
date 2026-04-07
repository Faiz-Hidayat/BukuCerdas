import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idItem = parseInt(id);
    const { jumlah } = await request.json();

    const qty = Number(jumlah);

    // C2: Qty negatif ditolak
    if (qty < 0) {
      return NextResponse.json({ error: 'Jumlah tidak valid' }, { status: 400 });
    }

    // Cek ownership: item harus milik keranjang user yang login
    const keranjang = await prisma.keranjang.findUnique({
      where: { idUser: user.idUser },
    });
    const item = await prisma.itemKeranjang.findUnique({
      where: { idItem },
      include: { buku: true },
    });
    if (!keranjang || !item || item.idKeranjang !== keranjang.idKeranjang) {
      return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
    }

    // C2: Qty 0 → hapus item dari keranjang
    if (qty === 0) {
      await prisma.itemKeranjang.delete({ where: { idItem } });
      return NextResponse.json({ message: 'Item dihapus dari keranjang' });
    }

    // C1: Qty tidak boleh melebihi stok
    if (qty > item.buku.stok) {
      return NextResponse.json(
        {
          error: `Stok tersedia hanya ${item.buku.stok}`,
        },
        { status: 400 },
      );
    }

    await prisma.itemKeranjang.update({
      where: { idItem },
      data: { jumlah: qty },
    });

    return NextResponse.json({ message: 'Berhasil update keranjang' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idItem = parseInt(id);

    // Cek ownership: item harus milik keranjang user yang login
    const keranjang = await prisma.keranjang.findUnique({
      where: { idUser: user.idUser },
    });
    const item = await prisma.itemKeranjang.findUnique({
      where: { idItem },
    });
    if (!keranjang || !item || item.idKeranjang !== keranjang.idKeranjang) {
      return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
    }

    await prisma.itemKeranjang.delete({
      where: { idItem },
    });

    return NextResponse.json({ message: 'Berhasil hapus item' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
