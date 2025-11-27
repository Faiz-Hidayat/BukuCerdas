'use client';

import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Bell, 
  TrendingUp,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardData {
  kpi: {
    totalBuku: number;
    totalUser: number;
    totalPesananHariIni: number;
    pendapatanBulanIni: number;
  };
  salesChart: { date: string; total: number }[];
  notifikasi: any[];
  pesananTerbaru: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const jsonData = await res.json();
          setData(jsonData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">Gagal memuat data dashboard.</div>;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Ringkasan aktivitas toko buku Anda hari ini.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Buku" 
          value={data.kpi.totalBuku} 
          icon={BookOpen} 
          gradient="from-blue-500 to-blue-600"
          shadow="shadow-blue-500/20"
        />
        <KpiCard 
          title="Total User" 
          value={data.kpi.totalUser} 
          icon={Users} 
          gradient="from-emerald-500 to-emerald-600"
          shadow="shadow-emerald-500/20"
        />
        <KpiCard 
          title="Pesanan Hari Ini" 
          value={data.kpi.totalPesananHariIni} 
          icon={ShoppingBag} 
          gradient="from-amber-500 to-amber-600"
          shadow="shadow-amber-500/20"
        />
        <KpiCard 
          title="Pendapatan Bulan Ini" 
          value={formatCurrency(data.kpi.pendapatanBulanIni)} 
          icon={DollarSign} 
          gradient="from-violet-500 to-violet-600"
          shadow="shadow-violet-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div variants={item} className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Tren Penjualan
              </h3>
              <p className="text-sm text-slate-500">Statistik penjualan 30 hari terakhir</p>
            </div>
          </div>
          <div className="h-72 flex items-end gap-3">
            {data.salesChart.length > 0 ? (
              data.salesChart.map((item, index) => {
                const maxVal = Math.max(...data.salesChart.map(d => d.total));
                const heightPercent = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div 
                      className="w-full bg-amber-100 hover:bg-amber-500 transition-all duration-300 rounded-t-lg relative group-hover:shadow-lg group-hover:shadow-amber-500/30"
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-xl">
                        {formatCurrency(item.total)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 rotate-0 truncate w-full text-center font-medium">
                      {item.date.split(' ')[0]}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Belum ada data penjualan
              </div>
            )}
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div variants={item} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Aktivitas Terbaru
          </h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[400px]">
            {data.notifikasi.length > 0 ? (
              data.notifikasi.map((notif, idx) => (
                <div key={notif.idNotifikasi} className="relative pl-6 pb-6 border-l border-slate-100 last:pb-0 last:border-0">
                  <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  <div>
                    <p className="text-sm text-slate-700 font-medium leading-snug">{notif.pesan}</p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {new Date(notif.tanggalNotifikasi).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Tidak ada notifikasi baru.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Pesanan Terbaru</h3>
            <p className="text-sm text-slate-500">5 transaksi terakhir yang masuk</p>
          </div>
          <button className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Lihat Semua <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Kode Pesanan</th>
                <th className="px-8 py-5">Pelanggan</th>
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5">Total Pembayaran</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.pesananTerbaru.length > 0 ? (
                data.pesananTerbaru.map((pesanan) => (
                  <tr key={pesanan.idPesanan} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
                      #{pesanan.kodePesanan}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                          {pesanan.user.namaLengkap.charAt(0)}
                        </div>
                        <span className="text-slate-700 font-medium">{pesanan.user.namaLengkap}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500">
                      {new Date(pesanan.tanggalPesan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-slate-900 font-bold">
                      {formatCurrency(Number(pesanan.totalBayar))}
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={pesanan.statusPesanan} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                    Belum ada pesanan yang masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function KpiCard({ title, value, icon: Icon, gradient, shadow }: { title: string, value: string | number, icon: any, gradient: string, shadow: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow duration-300"
    >
      <div className={`p-4 rounded-xl text-white bg-gradient-to-br ${gradient} ${shadow} shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    diproses: 'bg-blue-50 text-blue-700 border-blue-200',
    dikirim: 'bg-amber-50 text-amber-700 border-amber-200',
    selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dibatalkan: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

