import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const order = await prisma.pesanan.findUnique({
            where: { idPesanan: id },
            include: {
                user: true,
                alamatUser: true,
                detailPesanan: {
                    include: {
                        buku: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();
        const { statusPembayaran, statusPesanan } = body;

        const dataToUpdate: any = {};
        if (statusPembayaran) dataToUpdate.statusPembayaran = statusPembayaran;
        if (statusPesanan) dataToUpdate.statusPesanan = statusPesanan;

        const order = await prisma.pesanan.update({
            where: { idPesanan: id },
            data: dataToUpdate,
        });

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
