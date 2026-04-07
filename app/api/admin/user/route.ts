import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from 'bcryptjs';
import { requireAdmin } from "@/lib/auth";
import { getPaginationParams, paginationMeta } from "@/lib/pagination";

export async function GET(request: Request) {
    try {
        const admin = await requireAdmin();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const { page, limit, skip } = getPaginationParams(searchParams);

        const where: any = {};
        if (search) {
            where.OR = [
                { namaLengkap: { contains: search } },
                { email: { contains: search } },
                { username: { contains: search } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { tanggalDaftar: "desc" },
                skip,
                take: limit,
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
            }),
            prisma.user.count({ where }),
        ]);
        return NextResponse.json({ data: users, pagination: paginationMeta(total, page, limit) });
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED')
            return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
        if (error.message === 'FORBIDDEN')
            return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();

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
    } catch (error: any) {
        if (error.message === 'UNAUTHORIZED')
            return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
        if (error.message === 'FORBIDDEN')
            return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
