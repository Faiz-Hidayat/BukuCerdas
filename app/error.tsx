'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import Navbar from './(marketing)/_components/Navbar';
import Footer from './(marketing)/_components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Ups! Terjadi Kesalahan.</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md">
          Maaf, terjadi kesalahan yang tidak terduga pada sistem kami.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-600 transition-all shadow-sm hover:shadow"
          >
            <RefreshCcw className="w-5 h-5" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all hover:shadow-sm"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
