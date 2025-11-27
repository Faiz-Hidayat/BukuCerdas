import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function KatalogPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Katalog Buku</h1>
          <p className="text-slate-600">Jelajahi koleksi buku terbaik kami</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="bg-amber-100 text-amber-800 p-4 rounded-lg inline-flex items-center justify-center w-16 h-16 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Katalog Buku</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Halaman katalog akan diimplementasikan di phase berikutnya dengan fitur pencarian, filter kategori, dan detail buku.
          </p>
        </div>
      </div>
    </div>
  );
}
