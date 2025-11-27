'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, Package, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Order {
  idPesanan: number;
  kodePesanan: string;
  user: {
    namaLengkap: string;
  };
  tanggalPesan: string;
  totalBayar: string;
  metodePembayaran: string;
  statusPembayaran: string;
  statusPesanan: string;
}

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/pesanan');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.kodePesanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.statusPesanan === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(val));
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      diproses: 'bg-blue-50 text-blue-700 border-blue-200',
      dikirim: 'bg-amber-50 text-amber-700 border-amber-200',
      selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dibatalkan: 'bg-red-50 text-red-700 border-red-200',
    };
    
    const icons: Record<string, any> = {
      diproses: Clock,
      dikirim: Truck,
      selesai: CheckCircle,
      dibatalkan: XCircle,
    };

    const Icon = icons[status] || Package;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'diproses', label: 'Diproses' },
    { id: 'dikirim', label: 'Dikirim' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Data Pesanan</h2>
        <p className="text-slate-500 mt-1">Kelola pesanan masuk dan pantau status pengiriman.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs & Search */}
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode pesanan atau nama pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-8 py-5">Kode Pesanan</th>
                <th className="px-6 py-5">Pelanggan</th>
                <th className="px-6 py-5">Tanggal</th>
                <th className="px-6 py-5">Total</th>
                <th className="px-6 py-5">Pembayaran</th>
                <th className="px-6 py-5">Status Pesanan</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.idPesanan} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
                      #{order.kodePesanan}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                          {order.user.namaLengkap.charAt(0)}
                        </div>
                        <span className="text-slate-700 font-medium">{order.user.namaLengkap}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      {new Date(order.tanggalPesan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-slate-900 font-bold">
                      {formatCurrency(order.totalBayar)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                        order.statusPembayaran === 'terkonfirmasi' 
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50' 
                          : order.statusPembayaran === 'dibatalkan'
                          ? 'border-red-200 text-red-700 bg-red-50'
                          : 'border-amber-200 text-amber-700 bg-amber-50'
                      }`}>
                        {order.statusPembayaran.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(order.statusPesanan)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/pesanan/${order.idPesanan}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-lg transition-all text-xs font-medium shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <p>Tidak ada pesanan ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
