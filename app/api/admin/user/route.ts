import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { tanggalDaftar: "desc" },
            select: {
                idUser: true,
                namaLengkap: true,
                username: true,
                email: true,
                role: true,
                fotoProfilUrl: true,
                tanggalDaftar: true,
                statusAkun: true,
            },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { namaLengkap, username, email, password, role, statusAkun } = body;

        // Basic validation
        if (!namaLengkap || !username || !email || !password || !role) {
            return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
        }

        // Check existing
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Username atau Email sudah digunakan" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                namaLengkap,
                username,
                email,
                kataSandiHash: hashedPassword,
                role,
                statusAkun: statusAkun || 'aktif',
            },
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

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
