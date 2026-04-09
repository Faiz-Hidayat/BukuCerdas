import Link from 'next/link';
import { ShoppingBag, Home } from 'lucide-react';
import Navbar from './(marketing)/_components/Navbar';
import Footer from './(marketing)/_components/Footer';

export const metadata = {
  title: 'Halaman Tidak Ditemukan - BukuCerdas',
  description: 'Halaman yang Anda cari tidak ditemukan.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          Silakan kembali ke beranda untuk menemukan buku yang Anda cari.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-600 transition-all shadow-sm hover:shadow"
        >
          <Home className="w-5 h-5" />
          Kembali ke Beranda
        </Link>
      </div>
      <Footer />
    </div>
  );
}
