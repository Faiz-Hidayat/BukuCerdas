import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-slate-900 text-white p-1.5 rounded-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">BukuCerdas</span>
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Masuk ke Akun Anda</h1>
          <p className="text-slate-600">Belum punya akun? <Link href="/register" className="text-amber-700 hover:text-amber-800 font-medium">Daftar di sini</Link></p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <p className="text-slate-600 text-center">
            Halaman login akan diimplementasikan di phase berikutnya dengan autentikasi JWT.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href="/" className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-full font-medium text-center hover:bg-slate-800 transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
