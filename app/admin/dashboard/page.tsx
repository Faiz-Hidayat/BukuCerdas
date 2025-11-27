import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-md">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Dashboard Admin</h1>
              <p className="text-sm text-slate-600">BukuCerdas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm">
              Lihat Website
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="bg-amber-100 text-amber-800 p-4 rounded-lg inline-flex items-center justify-center w-16 h-16 mb-4">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Dashboard Admin</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            Halaman admin akan diimplementasikan di phase berikutnya dengan fitur kelola buku, kategori, pesanan, dan laporan.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700">Dashboard</div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700">Kategori Buku</div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700">Kelola Buku</div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700">Kelola User</div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700">Pesanan</div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700">Laporan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
