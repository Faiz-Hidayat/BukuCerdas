import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idAlamat = parseInt(id);
    const data = await request.json();

    if (data.isDefault) {
      await prisma.alamatUser.updateMany({
        where: { idUser: user.idUser },
        data: { isDefault: false },
      });
    }

    const alamat = await prisma.alamatUser.update({
      where: { idAlamat, idUser: user.idUser },
      data,
    });

    return NextResponse.json(alamat);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const idAlamat = parseInt(id);

    await prisma.alamatUser.delete({
      where: { idAlamat, idUser: user.idUser },
    });

    return NextResponse.json({ message: 'Alamat berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
