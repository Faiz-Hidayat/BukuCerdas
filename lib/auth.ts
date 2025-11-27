import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Nama cookie untuk JWT token
export const COOKIE_NAME = 'bukucerdas_token';

// Secret key untuk JWT (harus sama dengan di .env)
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET tidak ditemukan di environment variables');
  }
  return new TextEncoder().encode(secret);
};

// Tipe data payload JWT
export interface JwtPayload {
  idUser: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  [key: string]: unknown; // Index signature untuk kompatibilitas dengan JWTPayload
}

/**
 * Membuat JWT token dari payload user
 * Token akan expired dalam 7 hari
 */
export async function createToken(payload: JwtPayload): Promise<string> {
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token valid selama 7 hari
    .sign(getJwtSecret());

  return token;
}

/**
 * Verifikasi dan decode JWT token
 * Return payload jika valid, throw error jika tidak valid
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return verified.payload as unknown as JwtPayload;
  } catch (error) {
    throw new Error('Token tidak valid atau sudah kadaluarsa');
  }
}

/**
 * Set JWT token ke HTTP-only cookie
 * Cookie ini aman dari XSS attack karena tidak bisa diakses via JavaScript
 */
export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // Tidak bisa diakses via JavaScript (keamanan dari XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS only di production
    sameSite: 'lax', // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  });
}

/**
 * Hapus JWT token dari cookie (untuk logout)
 */
export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Ambil JWT token dari cookie
 */
export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Ambil user saat ini dari JWT token di cookie
 * Return null jika tidak ada token atau token tidak valid
 */
export async function getCurrentUser(): Promise<JwtPayload | null> {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return null;
    }
    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Cek apakah user adalah admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Cek apakah user sudah login
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
