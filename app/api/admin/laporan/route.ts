import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type") || "daily"; // daily | monthly

    if (!startDate || !endDate) {
        return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    try {
        // Fetch Income (Pesanan)
        const orders = await prisma.pesanan.findMany({
            where: {
                tanggalPesan: {
                    gte: start,
                    lte: end,
                },
                statusPembayaran: "terkonfirmasi",
            },
            select: {
                idPesanan: true,
                tanggalPesan: true,
                totalBayar: true,
                kodePesanan: true,
            },
            orderBy: {
                tanggalPesan: "asc",
            },
        });

        // Fetch Expenses (Pengeluaran)
        const expenses = await prisma.pengeluaran.findMany({
            where: {
                tanggal: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: {
                tanggal: "asc",
            },
        });

        const totalPendapatan = orders.reduce((acc, curr) => acc + Number(curr.totalBayar), 0);
        const totalPengeluaran = expenses.reduce((acc, curr) => acc + Number(curr.nominal), 0);
        const totalPesanan = orders.length;

        // Combine for Transaction History
        const transactions = [
            ...orders.map(o => ({
                id: `INC-${o.idPesanan}`,
                date: o.tanggalPesan,
                type: 'pemasukan',
                description: `Pesanan #${o.kodePesanan}`,
                amount: Number(o.totalBayar),
                refCode: o.kodePesanan
            })),
            ...expenses.map(e => ({
                id: `EXP-${e.idPengeluaran}`,
                date: e.tanggal,
                type: 'pengeluaran',
                description: e.judul,
                amount: Number(e.nominal),
                refCode: '-'
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Prepare Chart Data
        const chartDataMap = new Map<string, { income: number; expense: number }>();

        // Helper to get key based on type
        const getKey = (date: Date) => {
            if (type === 'monthly') {
                return date.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' });
            }
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
        };

        orders.forEach((order) => {
            const key = getKey(new Date(order.tanggalPesan));
            const current = chartDataMap.get(key) || { income: 0, expense: 0 };
            current.income += Number(order.totalBayar);
            chartDataMap.set(key, current);
        });

        expenses.forEach((expense) => {
            const key = getKey(new Date(expense.tanggal));
            const current = chartDataMap.get(key) || { income: 0, expense: 0 };
            current.expense += Number(expense.nominal);
            chartDataMap.set(key, current);
        });

        const sortedKeys = Array.from(chartDataMap.keys()).sort();
        
        const chartData = sortedKeys.map(key => ({
            date: key,
            income: chartDataMap.get(key)?.income || 0,
            expense: chartDataMap.get(key)?.expense || 0,
        }));

        return NextResponse.json({
            totalPendapatan,
            totalPengeluaran,
            totalPesanan,
            chartData,
            transactions,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
