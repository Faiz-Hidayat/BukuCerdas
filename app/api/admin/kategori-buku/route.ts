import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.kategoriBuku.findMany({
            orderBy: { namaKategori: "asc" },
            include: {
                _count: {
                    select: { buku: true },
                },
            },
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { namaKategori, deskripsi } = body;

        if (!namaKategori) {
            return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
        }

        const category = await prisma.kategoriBuku.create({
            data: {
                namaKategori,
                deskripsi,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
