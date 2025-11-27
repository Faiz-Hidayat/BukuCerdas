'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    namaLengkap: '',
    username: '',
    email: '',
    kataSandi: '',
    konfirmasiKataSandi: '',
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    // Validasi konfirmasi kata sandi
    if (formData.kataSandi !== formData.konfirmasiKataSandi) {
      setError('Konfirmasi kata sandi tidak sama');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          username: formData.username,
          email: formData.email,
          kataSandi: formData.kataSandi,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors
        if (data.errors && Array.isArray(data.errors)) {
          const errors: Record<string, string> = {};
          data.errors.forEach((err: { field: string; pesan: string }) => {
            errors[err.field] = err.pesan;
          });
          setFieldErrors(errors);
        } else {
          setError(data.pesan || 'Terjadi kesalahan saat registrasi');
        }
        setIsLoading(false);
        return;
      }

      // Registrasi berhasil
      setSuccess(true);
      setTimeout(() => {
        router.push('/katalog');
      }, 1500);
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
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: '',
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Registrasi Berhasil!</h2>
            <p className="text-slate-600 mb-4">Akun Anda telah dibuat. Mengalihkan ke katalog...</p>
            <Loader2 className="w-6 h-6 animate-spin text-amber-700 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Daftar Akun Baru</h1>
          <p className="text-slate-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-amber-700 hover:text-amber-800 font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="namaLengkap" className="block text-sm font-medium text-slate-900 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="namaLengkap"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Masukkan nama lengkap"
              />
              {fieldErrors.namaLengkap && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.namaLengkap}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-900 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Masukkan username"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Masukkan email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
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
                placeholder="Minimal 8 karakter"
              />
              {fieldErrors.kataSandi && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.kataSandi}</p>
              )}
            </div>

            <div>
              <label htmlFor="konfirmasiKataSandi" className="block text-sm font-medium text-slate-900 mb-2">
                Konfirmasi Kata Sandi
              </label>
              <input
                type="password"
                id="konfirmasiKataSandi"
                name="konfirmasiKataSandi"
                value={formData.konfirmasiKataSandi}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Ulangi kata sandi"
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
                'Daftar Sekarang'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
