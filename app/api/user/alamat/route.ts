import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alamat = await prisma.alamatUser.findMany({
      where: { idUser: user.idUser },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json(alamat);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Jika alamat pertama, set default
    const count = await prisma.alamatUser.count({
      where: { idUser: user.idUser },
    });

    const isDefault = count === 0 || data.isDefault;

    if (isDefault) {
      // Reset default lain
      await prisma.alamatUser.updateMany({
        where: { idUser: user.idUser },
        data: { isDefault: false },
      });
    }

    const alamat = await prisma.alamatUser.create({
      data: {
        ...data,
        idUser: user.idUser,
        isDefault,
      },
    });

    return NextResponse.json(alamat);
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
