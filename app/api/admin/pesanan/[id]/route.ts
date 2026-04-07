import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updatePesananSchema } from "@/lib/validations/pesanan";
import { isValidTransition, isFinalStatus } from "@/lib/pesanan-status";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await requireAdmin();

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
        const body = await request.json();

        // Validasi dengan Zod
        const parsed = updatePesananSchema.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(e => e.message).join(', ');
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        const { statusPembayaran, statusPesanan: statusPesananBaru, resi } = parsed.data;

        // Ambil pesanan saat ini
        const pesanan = await prisma.pesanan.findUnique({
            where: { idPesanan: id },
        });

        if (!pesanan) {
            return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        // Validasi transisi status pesanan (PRD 12.8)
        if (statusPesananBaru) {
            if (isFinalStatus(pesanan.statusPesanan)) {
                return NextResponse.json({
                    error: `Pesanan dengan status "${pesanan.statusPesanan}" tidak bisa diubah`
                }, { status: 400 });
            }

            if (!isValidTransition(pesanan.statusPesanan, statusPesananBaru)) {
                return NextResponse.json({
                    error: `Tidak bisa mengubah status dari "${pesanan.statusPesanan}" ke "${statusPesananBaru}"`
                }, { status: 400 });
            }

            // I1: Resi wajib saat ubah ke Dikirim
            if (statusPesananBaru === 'dikirim' && !resi && !pesanan.resi) {
                return NextResponse.json({
                    error: 'Nomor resi wajib diisi sebelum mengirim pesanan'
                }, { status: 400 });
            }
        }

        const dataToUpdate: any = {};
        if (statusPembayaran) dataToUpdate.statusPembayaran = statusPembayaran;
        if (statusPesananBaru) dataToUpdate.statusPesanan = statusPesananBaru;
        if (resi) dataToUpdate.resi = resi;

        // Jika status baru = dibatalkan → kembalikan stok dalam transaction (J2, 12.9)
        if (statusPesananBaru === 'dibatalkan') {
            const result = await prisma.$transaction(async (tx) => {
                const updated = await tx.pesanan.update({
                    where: { idPesanan: id },
                    data: dataToUpdate,
                });

                // Kembalikan stok untuk setiap item
                const details = await tx.detailPesanan.findMany({
                    where: { idPesanan: id },
                });
                for (const detail of details) {
                    await tx.buku.update({
                        where: { idBuku: detail.idBuku },
                        data: { stok: { increment: detail.jumlah } },
                    });
                }

                return updated;
            });

            return NextResponse.json(result);
        }

        const order = await prisma.pesanan.update({
            where: { idPesanan: id },
            data: dataToUpdate,
        });

        return NextResponse.json(order);
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED')
            return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
        if (error.message === 'FORBIDDEN')
            return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
