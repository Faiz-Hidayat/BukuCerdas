import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notifikasi = await prisma.notifikasiAdmin.findMany({
      orderBy: { tanggalNotifikasi: 'desc' },
      take: 10,
      include: {
        pesanan: {
          select: { kodePesanan: true }
        }
      }
    });
    
    const unreadCount = await prisma.notifikasiAdmin.count({
      where: { sudahDibaca: false }
    });

    return NextResponse.json({ notifikasi, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH() {
  const auth = await getCurrentUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.notifikasiAdmin.updateMany({
      where: { sudahDibaca: false },
      data: { sudahDibaca: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
