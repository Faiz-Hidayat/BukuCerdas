import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile, validateUploadFile, deleteOldFile } from "@/lib/upload";
import { requireAdmin } from "@/lib/auth";
import { bukuSchema } from "@/lib/validations/buku";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await requireAdmin();

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const book = await prisma.buku.findUnique({
            where: { idBuku: id },
            include: { kategoriBuku: true },
        });

        if (!book) {
            return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json(book);
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED')
            return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
        if (error.message === 'FORBIDDEN')
            return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await requireAdmin();

        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const formData = await request.formData();

        const judul = formData.get("judul") as string;
        const pengarang = formData.get("pengarang") as string;
        const penerbit = formData.get("penerbit") as string;
        const tahunTerbit = parseInt(formData.get("tahunTerbit") as string);
        const isbn = formData.get("isbn") as string;
        const stok = parseInt(formData.get("stok") as string);
        const harga = parseFloat(formData.get("harga") as string);
        const sinopsis = formData.get("sinopsis") as string;
        const idKategori = parseInt(formData.get("idKategori") as string);
        const statusAktif = formData.get("statusAktif") === "true";

        const coverFile = formData.get("coverImage") as File | null;
        const coverUrlInput = formData.get("coverUrl") as string;

        // Validasi dengan Zod (B3, B4, B7)
        const parsed = bukuSchema.safeParse({
            judul, pengarang, penerbit, tahunTerbit, harga, stok, idKategori,
            sinopsis: sinopsis || undefined,
            isbn: isbn || undefined,
        });
        if (!parsed.success) {
            const errors = parsed.error.issues.map(e => e.message).join(', ');
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        const dataToUpdate: any = {
            judul,
            pengarang,
            penerbit,
            tahunTerbit,
            isbn,
            stok,
            harga,
            sinopsis,
            idKategori,
            statusAktif,
        };

        if (coverFile && coverFile.size > 0) {
            // Validasi file upload (H1, H3, H4)
            const uploadError = validateUploadFile(coverFile);
            if (uploadError) {
                return NextResponse.json({ error: uploadError }, { status: 400 });
            }
            // H6: Hapus cover lama
            const existingBook = await prisma.buku.findUnique({ where: { idBuku: id }, select: { coverUrl: true } });
            await deleteOldFile(existingBook?.coverUrl);
            dataToUpdate.coverUrl = await saveFile(coverFile, "cover-buku");
        } else if (coverUrlInput !== undefined) {
            // Only update if explicitly provided (even if empty string to clear it, though usually we keep old if not changed)
            // If user wants to keep existing, they might not send anything or send the existing URL.
            // If the form sends the existing URL in coverUrlInput, we use it.
            dataToUpdate.coverUrl = coverUrlInput;
        }

        const book = await prisma.buku.update({
            where: { idBuku: id },
            data: dataToUpdate,
        });

        return NextResponse.json(book);
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED')
            return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
        if (error.message === 'FORBIDDEN')
            return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
        console.error("Error updating book:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await requireAdmin();

        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // B2: Cek apakah ada pesanan aktif yang memuat buku ini
        const pesananAktif = await prisma.detailPesanan.count({
            where: {
                idBuku: id,
                pesanan: {
                    statusPesanan: { notIn: ['selesai', 'dibatalkan'] },
                },
            },
        });
        if (pesananAktif > 0) {
            return NextResponse.json({
                error: `Buku tidak bisa dinonaktifkan karena ada ${pesananAktif} pesanan aktif`,
            }, { status: 400 });
        }

        // Soft delete
        await prisma.buku.update({
            where: { idBuku: id },
            data: { statusAktif: false },
        });

        return NextResponse.json({ message: "Buku berhasil dinonaktifkan" });
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED')
            return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
        if (error.message === 'FORBIDDEN')
            return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
