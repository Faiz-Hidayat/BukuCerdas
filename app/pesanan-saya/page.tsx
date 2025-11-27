'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../(marketing)/_components/Navbar';
import Footer from '../(marketing)/_components/Footer';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

interface Order {
  idPesanan: number;
  kodePesanan: string;
  tanggalPesan: string;
  statusPesanan: string;
  statusPembayaran: string;
  totalBayar: string;
  detailPesanan: {
    buku: {
      judul: string;
      coverUrl: string;
    };
    jumlah: number;
  }[];
}

export default function PesananSayaPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/pesanan');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selesai':
      case 'terkonfirmasi':
        return 'bg-green-100 text-green-700';
      case 'diproses':
      case 'dikirim':
        return 'bg-blue-100 text-blue-700';
      case 'menunggu_konfirmasi':
      case 'menunggu_pembayaran':
      case 'belum_dibayar':
        return 'bg-amber-100 text-amber-700';
      case 'dibatalkan':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="h-32 bg-slate-200 rounded w-full" />
            <div className="h-32 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Pesanan Saya</h1>

        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.idPesanan} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Package className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{order.kodePesanan}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(order.tanggalPesan).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.statusPembayaran)}`}>
                        {getStatusLabel(order.statusPembayaran)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.statusPesanan)}`}>
                        {getStatusLabel(order.statusPesanan)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                            {order.detailPesanan[0]?.buku.coverUrl && (
                              <img 
                                src={order.detailPesanan[0].buku.coverUrl} 
                                alt={order.detailPesanan[0].buku.judul} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1">
                              {order.detailPesanan[0]?.buku.judul}
                            </p>
                            {order.detailPesanan.length > 1 && (
                              <p className="text-sm text-slate-500">
                                + {order.detailPesanan.length - 1} buku lainnya
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Total Belanja</p>
                          <p className="font-bold text-slate-900">
                            Rp {parseFloat(order.totalBayar).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Link
                          href={`/pesanan-saya/${order.idPesanan}`}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Belum Ada Pesanan</h2>
              <p className="text-slate-500 mb-8">Kamu belum pernah berbelanja di sini.</p>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-600 transition-colors"
              >
                Mulai Belanja
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
