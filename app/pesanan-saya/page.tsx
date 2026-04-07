'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../(marketing)/_components/Navbar';
import Footer from '../(marketing)/_components/Footer';
import Pagination from '../_components/Pagination';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck, ShoppingBag, Loader2 } from 'lucide-react';

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

const STATUS_TABS = [
  { key: '', label: 'Semua', icon: ShoppingBag },
  { key: 'menunggu_pembayaran', label: 'Menunggu Bayar', icon: Clock },
  { key: 'menunggu_verifikasi', label: 'Verifikasi', icon: Loader2 },
  { key: 'diproses', label: 'Diproses', icon: Package },
  { key: 'dikirim', label: 'Dikirim', icon: Truck },
  { key: 'selesai', label: 'Selesai', icon: CheckCircle },
  { key: 'dibatalkan', label: 'Dibatalkan', icon: XCircle },
];

function PesananSayaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [activeStatus, setActiveStatus] = useState(searchParams.get('status') || '');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');
      params.set('counts', '1');
      if (activeStatus) params.set('status', activeStatus);

      const res = await fetch(`/api/user/pesanan?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data);
        setTotalPages(json.pagination.totalPages);
        if (json.statusCounts) setStatusCounts(json.statusCounts);
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeStatus]);

  useEffect(() => {
    fetchOrders();
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (activeStatus) params.set('status', activeStatus);
    const qs = params.toString();
    router.replace(`/pesanan-saya${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [currentPage, activeStatus, fetchOrders, router]);

  const handleTabChange = (status: string) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);

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
      case 'menunggu_verifikasi':
      case 'belum_dibayar':
        return 'bg-amber-100 text-amber-700';
      case 'dibatalkan':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Pesanan Saya</h1>

        {/* Filter Tabs */}
        <div className="mb-6 -mx-6 px-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {STATUS_TABS.map((tab) => {
              const count = tab.key === '' ? totalAll : statusCounts[tab.key] || 0;
              const isActive = activeStatus === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-amber-600'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-100 p-6">
                <div className="flex justify-between mb-4">
                  <div className="h-5 bg-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 rounded w-1/6" />
                </div>
                <div className="h-16 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <Link
                  key={order.idPesanan}
                  href={`/pesanan-saya/${order.idPesanan}`}
                  className="block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-amber-200 transition-all group">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-50 transition-colors">
                          <Package className="w-6 h-6 text-slate-600 group-hover:text-amber-600 transition-colors" />
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
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.statusPembayaran)}`}>
                          {getStatusLabel(order.statusPembayaran)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.statusPesanan)}`}>
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
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  {activeStatus ? 'Tidak Ada Pesanan' : 'Belum Ada Pesanan'}
                </h2>
                <p className="text-slate-500 mb-8">
                  {activeStatus
                    ? `Tidak ada pesanan dengan status "${getStatusLabel(activeStatus)}".`
                    : 'Kamu belum pernah berbelanja di sini.'}
                </p>
                {!activeStatus && (
                  <Link
                    href="/katalog"
                    className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-600 transition-colors">
                    Mulai Belanja
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <Footer />
    </div>
  );
}

export default function PesananSayaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <PesananSayaContent />
    </Suspense>
  );
}
