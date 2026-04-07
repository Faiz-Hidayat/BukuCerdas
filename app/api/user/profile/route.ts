import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { saveFile, validateUploadFile, deleteOldFile } from '@/lib/upload';

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
      // Validasi file upload (H1, H3, H4)
      const uploadError = validateUploadFile(fotoProfil);
      if (uploadError) {
        return NextResponse.json({ error: uploadError }, { status: 400 });
      }
      // H6: Hapus foto lama
      const currentUser = await prisma.user.findUnique({
        where: { idUser: user.idUser },
        select: { fotoProfilUrl: true },
      });
      await deleteOldFile(currentUser?.fotoProfilUrl);
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
