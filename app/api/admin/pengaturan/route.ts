import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile, validateUploadFile, deleteOldFile } from "@/lib/upload";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
    try {
        const admin = await requireAdmin();

        let settings = await prisma.pengaturanToko.findFirst();
        if (!settings) {
            settings = await prisma.pengaturanToko.create({
                data: {
                    pajakPersen: 11,
                    nomorRekening: "",
                    nomorEwallet: "",
                    qrisUrl: "",
                },
            });
        }
        return NextResponse.json(settings);
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED')
            return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
        if (error.message === 'FORBIDDEN')
            return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const admin = await requireAdmin();

        const formData = await request.formData();
        const pajakPersen = parseFloat(formData.get("pajakPersen") as string);
        const nomorRekening = formData.get("nomorRekening") as string;
        const nomorEwallet = formData.get("nomorEwallet") as string;
        const qrisFile = formData.get("qrisImage") as File | null;
        const qrisUrlInput = formData.get("qrisUrl") as string;
        
        const aktifCOD = formData.get("aktifCOD") === 'true';
        const aktifTransfer = formData.get("aktifTransfer") === 'true';
        const aktifEwallet = formData.get("aktifEwallet") === 'true';
        const aktifQRIS = formData.get("aktifQRIS") === 'true';

        let settings = await prisma.pengaturanToko.findFirst();
        if (!settings) {
            settings = await prisma.pengaturanToko.create({
                data: { pajakPersen: 11 },
            });
        }

        let finalQrisUrl = qrisUrlInput || settings.qrisUrl;

        if (qrisFile && qrisFile.size > 0) {
            // Validasi file upload (H1, H3, H4)
            const uploadError = validateUploadFile(qrisFile);
            if (uploadError) {
                return NextResponse.json({ error: uploadError }, { status: 400 });
            }
            // H6: Hapus QRIS lama
            await deleteOldFile(settings.qrisUrl);
            finalQrisUrl = await saveFile(qrisFile, "qris");
        }

        const updated = await prisma.pengaturanToko.update({
            where: { idPengaturan: settings.idPengaturan },
            data: {
                pajakPersen,
                nomorRekening,
                nomorEwallet,
                qrisUrl: finalQrisUrl,
                aktifCOD,
                aktifTransfer,
                aktifEwallet,
                aktifQRIS
            },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED')
            return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
        if (error.message === 'FORBIDDEN')
            return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
