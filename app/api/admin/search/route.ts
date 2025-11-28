import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const searchQuery = query.trim();

  try {
    const [buku, users, pesanan] = await Promise.all([
      prisma.buku.findMany({
        where: {
          OR: [
            { judul: { contains: searchQuery } },
            { pengarang: { contains: searchQuery } },
            { isbn: { contains: searchQuery } },
          ],
        },
        take: 5,
        select: {
          idBuku: true,
          judul: true,
          pengarang: true,
          coverUrl: true,
        },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { namaLengkap: { contains: searchQuery } },
            { email: { contains: searchQuery } },
            { username: { contains: searchQuery } },
          ],
          role: "user",
        },
        take: 5,
        select: {
          idUser: true,
          namaLengkap: true,
          email: true,
        },
      }),
      prisma.pesanan.findMany({
        where: {
          OR: [
            { kodePesanan: { contains: searchQuery } },
            { user: { namaLengkap: { contains: searchQuery } } },
          ],
        },
        take: 5,
        select: {
          idPesanan: true,
          kodePesanan: true,
          statusPesanan: true,
          user: {
            select: {
              namaLengkap: true,
            },
          },
        },
        orderBy: {
          tanggalPesan: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      results: {
        buku,
        users,
        pesanan,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
