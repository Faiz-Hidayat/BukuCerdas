import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await requireAdmin();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. KPI Cards — I3: pendapatan hanya dari pesanan selesai
    const [
      totalBuku,
      totalUser,
      totalPesananHariIni,
      pendapatanBulanIniResult,
      pendapatanHariIniResult,
      pesananMenunggu,
    ] = await Promise.all([
      prisma.buku.count({
        where: { statusAktif: true },
      }),
      prisma.user.count({
        where: { role: 'user' },
      }),
      prisma.pesanan.count({
        where: {
          tanggalPesan: {
            gte: startOfDay,
          },
        },
      }),
      prisma.pesanan.aggregate({
        _sum: {
          totalBayar: true,
        },
        where: {
          statusPesanan: 'selesai',
          tanggalPesan: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.pesanan.aggregate({
        _sum: {
          totalBayar: true,
        },
        where: {
          statusPesanan: 'selesai',
          tanggalPesan: {
            gte: startOfDay,
          },
        },
      }),
      prisma.pesanan.count({
        where: {
          statusPesanan: {
            in: ['menunggu_pembayaran', 'menunggu_verifikasi'],
          },
        },
      }),
    ]);

    const pendapatanBulanIni = pendapatanBulanIniResult._sum.totalBayar || 0;
    const pendapatanHariIni = pendapatanHariIniResult._sum.totalBayar || 0;

    // 2. Chart Data (Last 30 Days Revenue) — I3: hanya pesanan selesai
    const salesData = await prisma.$queryRaw`
      SELECT 
        DATE(tanggal_pesan) as date, 
        SUM(total_bayar) as total 
      FROM pesanan 
      WHERE tanggal_pesan >= ${thirtyDaysAgo} 
      AND status_pesanan = 'selesai'
      GROUP BY DATE(tanggal_pesan) 
      ORDER BY date ASC
    `;

    // Format salesData to be JSON serializable (BigInt handling if necessary, though Decimal usually maps to string/number)
    // Prisma Decimal returns as Decimal object or string. queryRaw might return different types.
    // We need to ensure the date is formatted and total is a number.
    const formattedSalesData = (salesData as any[]).map((item) => ({
      date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      total: Number(item.total) || 0,
    }));

    // 3. Recent Notifications
    const notifikasi = await prisma.notifikasiAdmin.findMany({
      where: { sudahDibaca: false },
      orderBy: { tanggalNotifikasi: 'desc' },
      take: 5,
      include: {
        pesanan: {
          select: {
            kodePesanan: true,
            user: {
              select: { namaLengkap: true },
            },
          },
        },
      },
    });

    // 4. Recent Orders (Ringkasan Pesanan Terbaru)
    const pesananTerbaru = await prisma.pesanan.findMany({
      take: 5,
      orderBy: { tanggalPesan: 'desc' },
      include: {
        user: {
          select: { namaLengkap: true },
        },
      },
    });

    return NextResponse.json({
      kpi: {
        totalBuku,
        totalUser,
        totalPesananHariIni,
        pendapatanBulanIni,
        pendapatanHariIni,
        pesananMenunggu,
      },
      salesChart: formattedSalesData,
      notifikasi,
      pesananTerbaru,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
