'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, User, Search, Menu, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Notifikasi {
  idNotifikasi: number;
  tipe: string;
  pesan: string;
  sudahDibaca: boolean;
  tanggalNotifikasi: string;
  pesanan?: {
    kodePesanan: string;
  };
}

export default function Topbar() {
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifikasi = async () => {
    try {
      const res = await fetch('/api/admin/notifikasi');
      if (res.ok) {
        const data = await res.json();
        setNotifikasi(data.notifikasi);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Gagal mengambil notifikasi', error);
    }
  };

  useEffect(() => {
    fetchNotifikasi();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifikasi, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async () => {
    if (unreadCount > 0) {
      try {
        await fetch('/api/admin/notifikasi', { method: 'PATCH' });
        setUnreadCount(0);
        setNotifikasi(prev => prev.map(n => ({ ...n, sudahDibaca: true })));
      } catch (error) {
        console.error('Gagal update notifikasi', error);
      }
    }
  };

  const toggleNotif = () => {
    if (!showNotif) {
      handleMarkAsRead();
    }
    setShowNotif(!showNotif);
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 fixed top-0 right-0 left-72 z-20 flex items-center justify-between px-8 transition-all duration-300">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Dashboard <span className="text-amber-600">Admin</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Search Bar (Visual Only) */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari sesuatu..." 
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-4" ref={notifRef}>
          <div className="relative">
            <button 
              onClick={toggleNotif}
              className="relative p-2.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all rounded-full"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotif && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Notifikasi</h3>
                    <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                      {notifikasi.length} Terbaru
                    </span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifikasi.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Belum ada notifikasi</p>
                      </div>
                    ) : (
                      notifikasi.map((n) => (
                        <div key={n.idNotifikasi} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.sudahDibaca ? 'bg-amber-50/30' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.sudahDibaca ? 'bg-amber-500' : 'bg-slate-300'}`} />
                            <div>
                              <p className="text-sm text-slate-700 leading-snug">{n.pesan}</p>
                              <p className="text-xs text-slate-400 mt-1.5">
                                {new Date(n.tanggalNotifikasi).toLocaleDateString('id-ID', { 
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                    <Link href="/admin/pesanan" className="text-xs font-medium text-amber-600 hover:text-amber-700">
                      Lihat Semua Pesanan
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">Admin</p>
              <p className="text-xs text-slate-500 font-medium">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center text-amber-700 shadow-sm border border-white ring-2 ring-slate-50">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
