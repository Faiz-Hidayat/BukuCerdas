import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ canReview: false, reason: 'not_logged_in' });
  }

  const { id } = await params;
  const idBuku = parseInt(id);
  const idUser = user.idUser;

  // Check if user has purchased the book and order is completed
  const purchase = await prisma.detailPesanan.findFirst({
    where: {
      idBuku: idBuku,
      pesanan: {
        idUser: idUser,
        statusPesanan: 'selesai',
      },
    },
  });

  if (!purchase) {
    return NextResponse.json({ canReview: false, reason: 'not_purchased' });
  }

  // Check if user already reviewed
  const existingReview = await prisma.ulasanBuku.findFirst({
    where: {
      idBuku: idBuku,
      idUser: idUser,
    },
  });

  if (existingReview) {
    return NextResponse.json({ canReview: false, reason: 'already_reviewed' });
  }

  return NextResponse.json({ canReview: true });
}
