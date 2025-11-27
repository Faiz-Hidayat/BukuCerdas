import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const orders = await prisma.pesanan.findMany({
            orderBy: { tanggalPesan: "desc" },
            include: {
                user: {
                    select: { namaLengkap: true },
                },
            },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
