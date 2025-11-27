import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { saveFile } from '@/lib/upload';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const namaLengkap = formData.get('namaLengkap') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const nomorTelepon = formData.get('nomorTelepon') as string;
    const fotoProfil = formData.get('fotoProfil') as File | null;

    const data: any = {
      namaLengkap,
      username,
      email,
      nomorTelepon,
    };

    if (fotoProfil && fotoProfil.size > 0) {
      const url = await saveFile(fotoProfil, 'profil');
      data.fotoProfilUrl = url;
    }

    const updatedUser = await prisma.user.update({
      where: { idUser: user.idUser },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
