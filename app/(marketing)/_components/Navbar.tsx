'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  namaLengkap: string;
  role: string;
}

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Check auth
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const jsonData = await res.json();
          if (jsonData.sukses && jsonData.data) {
            setUser(jsonData.data);
          }
        }
      } catch (error) {
        console.error('Auth check failed', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#FDFBF7]/90 backdrop-blur-md border-b border-black/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-slate-900 text-white p-1.5 rounded-md group-hover:rotate-3 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
              BukuCerdas
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Beranda
            </Link>
            <a href="/#showcase" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Showcase
            </a>
            <a href="/#katalog" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Katalog
            </a>
            <Link href="/tentang-kami" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Tentang
            </Link>
            <a href="/#kontak" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Kontak
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-20 h-8 bg-slate-100 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600">
                  Halo, {user.namaLengkap ? user.namaLengkap.split(' ')[0] : 'User'}
                </span>
                {user.role === 'admin' ? (
                  <Link 
                    href="/admin/dashboard" 
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/profil" 
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium transition-all"
                  >
                    <User className="w-4 h-4" />
                    Profil
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Masuk
                </Link>
                <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="text-slate-900 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-b border-black/5 p-4 space-y-4">
          <Link 
            href="/"
            className="block text-sm font-medium text-slate-600 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Beranda
          </Link>
          <a 
            href="/#katalog"
            className="block text-sm font-medium text-slate-600 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Katalog
          </a>
          <Link 
            href="/tentang-kami"
            className="block text-sm font-medium text-slate-600 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Tentang
          </Link>
          <a 
            href="/#kontak"
            className="block text-sm font-medium text-slate-600 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Kontak
          </a>
          <div className="pt-4 flex flex-col gap-3 border-t border-slate-100 mt-2">
            {loading ? (
              <div className="w-full h-10 bg-slate-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.namaLengkap}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                {user.role === 'admin' ? (
                  <Link 
                    href="/admin/dashboard" 
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard Admin
                  </Link>
                ) : (
                  <Link 
                    href="/profil" 
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    Profil Saya
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="w-full text-sm font-medium text-slate-600 hover:text-slate-900 text-center py-2">
                  Masuk
                </Link>
                <Link href="/register" className="w-full bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium text-center">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
