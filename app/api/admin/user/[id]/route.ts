import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { statusAkun, role } = body;

    const dataToUpdate: any = {};
    if (statusAkun) dataToUpdate.statusAkun = statusAkun;
    if (role) dataToUpdate.role = role;

    const user = await prisma.user.update({
      where: { idUser: id },
      data: dataToUpdate,
      select: {
        idUser: true,
        namaLengkap: true,
        statusAkun: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
