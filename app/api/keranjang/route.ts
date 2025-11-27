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

    return NextResponse.json(keranjang);
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

    // Cek apakah item sudah ada di keranjang
    const existingItem = await prisma.itemKeranjang.findFirst({
      where: {
        idKeranjang: keranjang.idKeranjang,
        idBuku: Number(idBuku),
      },
    });

    if (existingItem) {
      await prisma.itemKeranjang.update({
        where: { idItem: existingItem.idItem },
        data: {
          jumlah: existingItem.jumlah + Number(jumlah),
        },
      });
    } else {
      await prisma.itemKeranjang.create({
        data: {
          idKeranjang: keranjang.idKeranjang,
          idBuku: Number(idBuku),
          jumlah: Number(jumlah),
        },
      });
    }

    return NextResponse.json({ message: 'Berhasil menambahkan ke keranjang' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
