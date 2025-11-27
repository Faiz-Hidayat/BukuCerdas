import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from 'bcryptjs';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();
        
        // Handle status toggle (simple update)
        if (Object.keys(body).length === 1 && body.statusAkun) {
            const updatedUser = await prisma.user.update({
                where: { idUser: id },
                data: { statusAkun: body.statusAkun },
            });
            return NextResponse.json(updatedUser);
        }

        // Handle full update
        const { namaLengkap, username, email, password, role, statusAkun } = body;

        const updateData: any = {
            namaLengkap,
            username,
            email,
            role,
            statusAkun
        };

        // Only update password if provided
        if (password && password.trim() !== "") {
            updateData.kataSandiHash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { idUser: id },
            data: updateData,
            select: {
                idUser: true,
                namaLengkap: true,
                username: true,
                email: true,
                role: true,
                statusAkun: true,
                tanggalDaftar: true,
                fotoProfilUrl: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        await prisma.user.delete({
            where: { idUser: id },
        });
        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
