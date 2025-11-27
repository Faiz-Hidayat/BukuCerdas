import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/upload";

export async function GET() {
    try {
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
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const pajakPersen = parseFloat(formData.get("pajakPersen") as string);
        const nomorRekening = formData.get("nomorRekening") as string;
        const nomorEwallet = formData.get("nomorEwallet") as string;
        const qrisFile = formData.get("qrisImage") as File | null;
        const qrisUrlInput = formData.get("qrisUrl") as string;

        let settings = await prisma.pengaturanToko.findFirst();
        if (!settings) {
            settings = await prisma.pengaturanToko.create({
                data: { pajakPersen: 11 },
            });
        }

        let finalQrisUrl = qrisUrlInput || settings.qrisUrl;

        if (qrisFile && qrisFile.size > 0) {
            finalQrisUrl = await saveFile(qrisFile, "qris");
        }

        const updated = await prisma.pengaturanToko.update({
            where: { idPengaturan: settings.idPengaturan },
            data: {
                pajakPersen,
                nomorRekening,
                nomorEwallet,
                qrisUrl: finalQrisUrl,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
