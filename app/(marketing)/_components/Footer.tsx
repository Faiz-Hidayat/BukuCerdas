'use client';

import React from 'react';
import { BookOpen, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="kontak" className="bg-white pt-20 pb-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-slate-900 text-white p-1.5 rounded-md">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">BukuCerdas</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Platform toko buku online terpercaya yang menyediakan literatur berkualitas untuk mencerdaskan bangsa.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Perusahaan</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-amber-700 transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">Karir</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Bantuan</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-amber-700 transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">Pengiriman</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">Retur Produk</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                halo@bukucerdas.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                +62 812 3456 7890
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                Jakarta Selatan, Indonesia
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© 2023 BukuCerdas. Hak Cipta Dilindungi.</p>
          <p className="text-xs text-slate-400">Dibuat dengan <span className="text-red-400">♥</span> untuk pembaca.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
