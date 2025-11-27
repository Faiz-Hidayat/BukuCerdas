import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Tanggal wajib diisi' }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  try {
    const orders = await prisma.pesanan.findMany({
      where: {
        tanggalPesan: {
          gte: start,
          lte: end,
        },
        statusPembayaran: 'terkonfirmasi',
      },
      select: {
        tanggalPesan: true,
        totalBayar: true,
        kodePesanan: true,
      },
      orderBy: {
        tanggalPesan: 'asc',
      },
    });

    const totalPendapatan = orders.reduce((acc, curr) => acc + Number(curr.totalBayar), 0);
    const totalPesanan = orders.length;

    // Group by date for chart
    const chartDataMap = new Map<string, number>();
    
    orders.forEach(order => {
      const dateStr = new Date(order.tanggalPesan).toLocaleDateString('id-ID');
      const current = chartDataMap.get(dateStr) || 0;
      chartDataMap.set(dateStr, current + Number(order.totalBayar));
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, total]) => ({
      date,
      total
    }));

    return NextResponse.json({
      totalPendapatan,
      totalPesanan,
      chartData,
      orders,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
