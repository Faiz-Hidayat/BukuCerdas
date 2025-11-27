import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();
        const { namaKategori, deskripsi } = body;

        if (!namaKategori) {
            return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
        }

        const category = await prisma.kategoriBuku.update({
            where: { idKategori: id },
            data: {
                namaKategori,
                deskripsi,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Check if category is used by any books
        const booksCount = await prisma.buku.count({
            where: { idKategori: id },
        });

        if (booksCount > 0) {
            return NextResponse.json({ error: "Kategori tidak bisa dihapus karena masih digunakan oleh buku." }, { status: 400 });
        }

        await prisma.kategoriBuku.delete({
            where: { idKategori: id },
        });

        return NextResponse.json({ message: "Kategori berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
