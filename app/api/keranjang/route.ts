import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let keranjang = await prisma.keranjang.findUnique({
      where: { idUser: user.idUser },
      include: {
        itemKeranjang: {
          include: {
            buku: true,
          },
        },
      },
    });

    if (!keranjang) {
      keranjang = await prisma.keranjang.create({
        data: {
          idUser: user.idUser,
        },
        include: {
          itemKeranjang: {
            include: {
              buku: true,
            },
          },
        },
      });
    }

    // C5 & C6: Auto-adjust stok berkurang, auto-remove buku tidak aktif/stok habis
    const warnings: string[] = [];
    for (const item of keranjang.itemKeranjang) {
      if (!item.buku.statusAktif) {
        // C6: Buku tidak aktif → hapus dari keranjang
        await prisma.itemKeranjang.delete({ where: { idItem: item.idItem } });
        warnings.push(`"${item.buku.judul}" sudah tidak tersedia dan dihapus dari keranjang`);
      } else if (item.jumlah > item.buku.stok) {
        if (item.buku.stok === 0) {
          // Stok habis → hapus dari keranjang
          await prisma.itemKeranjang.delete({ where: { idItem: item.idItem } });
          warnings.push(`"${item.buku.judul}" stok habis dan dihapus dari keranjang`);
        } else {
          // C5: Stok berkurang → auto-adjust quantity
          await prisma.itemKeranjang.update({
            where: { idItem: item.idItem },
            data: { jumlah: item.buku.stok },
          });
          warnings.push(`Stok "${item.buku.judul}" berubah, disesuaikan menjadi ${item.buku.stok}`);
        }
      }
    }

    // Re-fetch setelah adjustment
    if (warnings.length > 0) {
      keranjang = await prisma.keranjang.findUnique({
        where: { idUser: user.idUser },
        include: {
          itemKeranjang: {
            include: {
              buku: true,
            },
          },
        },
      }) as typeof keranjang;
    }

    return NextResponse.json({ ...keranjang, warnings });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idBuku, jumlah } = await request.json();

    if (!idBuku || !jumlah) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const qty = Number(jumlah);
    if (qty <= 0) {
      return NextResponse.json({ error: 'Jumlah harus minimal 1' }, { status: 400 });
    }

    // C1, C4: Cek buku ada, aktif, dan stok tersedia
    const buku = await prisma.buku.findUnique({
      where: { idBuku: Number(idBuku) },
    });
    if (!buku || !buku.statusAktif) {
      return NextResponse.json({ error: 'Buku tidak tersedia' }, { status: 404 });
    }
    if (buku.stok <= 0) {
      return NextResponse.json({ error: 'Stok habis' }, { status: 400 });
    }

    let keranjang = await prisma.keranjang.findUnique({
      where: { idUser: user.idUser },
    });

    if (!keranjang) {
      keranjang = await prisma.keranjang.create({
        data: {
          idUser: user.idUser,
        },
      });
    }

    // C3: Cek apakah item sudah ada di keranjang → increment
    const existingItem = await prisma.itemKeranjang.findFirst({
      where: {
        idKeranjang: keranjang.idKeranjang,
        idBuku: Number(idBuku),
      },
    });

    // C1: Total qty (existing + baru) tidak boleh melebihi stok
    const totalQty = (existingItem?.jumlah || 0) + qty;
    if (totalQty > buku.stok) {
      return NextResponse.json({
        error: `Stok tersedia hanya ${buku.stok}${existingItem ? `. Anda sudah memiliki ${existingItem.jumlah} di keranjang` : ''}`
      }, { status: 400 });
    }

    if (existingItem) {
      await prisma.itemKeranjang.update({
        where: { idItem: existingItem.idItem },
        data: { jumlah: totalQty },
      });
    } else {
      await prisma.itemKeranjang.create({
        data: {
          idKeranjang: keranjang.idKeranjang,
          idBuku: Number(idBuku),
          jumlah: qty,
        },
      });
    }

    return NextResponse.json({ message: 'Berhasil menambahkan ke keranjang' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
