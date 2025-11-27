import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Nama cookie yang menyimpan JWT token
const COOKIE_NAME = 'bukucerdas_token';

// Path yang memerlukan autentikasi
const PROTECTED_PATHS = [
  '/katalog',
  '/buku',
  '/keranjang',
  '/checkout',
  '/profil',
  '/pesanan-saya',
];

// Path yang hanya bisa diakses admin
const ADMIN_PATHS = ['/admin'];

// Path public yang tidak memerlukan autentikasi
const PUBLIC_PATHS = ['/', '/tentang-kami', '/login', '/register'];

// Helper untuk verify JWT token
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambil token dari cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Verifikasi token jika ada
  let user = null;
  if (token) {
    user = await verifyToken(token);
  }

  // 1. Proteksi route admin - hanya admin yang bisa akses
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (!user) {
      // Belum login, redirect ke login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== 'admin') {
      // Bukan admin, redirect ke home dengan pesan error
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // 2. Proteksi route yang memerlukan login (user atau admin)
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    if (!user) {
      // Belum login, redirect ke login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Redirect ke home jika sudah login dan mengakses login/register
  if ((pathname === '/login' || pathname === '/register') && user) {
    // Jika admin, redirect ke dashboard admin
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // Jika user biasa, redirect ke katalog
    return NextResponse.redirect(new URL('/katalog', request.url));
  }

  // Lanjutkan request
  return NextResponse.next();
}

// Konfigurasi matcher untuk middleware
// Hanya jalankan middleware di path tertentu
export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes (dihandle sendiri di route handler)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
