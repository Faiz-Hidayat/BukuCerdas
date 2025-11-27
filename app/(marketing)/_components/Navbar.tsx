'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              Daftar
            </Link>
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
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" className="w-full text-sm font-medium text-slate-600 hover:text-slate-900">
              Masuk
            </Link>
            <Link href="/register" className="w-full bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium text-center">
              Daftar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
