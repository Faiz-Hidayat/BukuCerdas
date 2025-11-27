'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/katalog';

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    kataSandi: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.pesan || 'Terjadi kesalahan saat login');
        setIsLoading(false);
        return;
      }

      // Login berhasil - redirect berdasarkan role
      if (data.data.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-slate-900 mb-2">
            Username atau Email
          </label>
          <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="Masukkan username atau email"
          />
        </div>

        <div>
          <label htmlFor="kataSandi" className="block text-sm font-medium text-slate-900 mb-2">
            Kata Sandi
          </label>
          <input
            type="password"
            id="kataSandi"
            name="kataSandi"
            value={formData.kataSandi}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="Masukkan kata sandi"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
          Kembali ke Beranda
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs text-slate-500 text-center">
          Demo: admin/admin123 (Admin) atau johndoe/user123 (User)
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-slate-900 text-white p-1.5 rounded-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">BukuCerdas</span>
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Masuk ke Akun Anda</h1>
          <p className="text-slate-600">
            Belum punya akun?{' '}
            <Link href="/register" className="text-amber-700 hover:text-amber-800 font-medium">
              Daftar di sini
            </Link>
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
