'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../(marketing)/_components/Navbar';
import Footer from '../../(marketing)/_components/Footer';
import { Package, MapPin, CreditCard, ArrowLeft, Upload } from 'lucide-react';

interface OrderDetail {
  idPesanan: number;
  kodePesanan: string;
  tanggalPesan: string;
  statusPesanan: string;
  statusPembayaran: string;
  metodePembayaran: string;
  subtotal: string;
  ongkir: string;
  pajakNominal: string;
  totalBayar: string;
  buktiPembayaranUrl: string | null;
  alamatUser: {
    namaPenerima: string;
    nomorTelepon: string;
    alamatLengkap: string;
    kota: string;
    provinsi: string;
    kodePos: string;
  };
  detailPesanan: {
    idDetail: number;
    jumlah: number;
    hargaSatuan: string;
    subtotal: string;
    buku: {
      idBuku: number;
      judul: string;
      coverUrl: string;
    };
  }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetail(params.id as string);
    }
  }, [params.id]);

  const fetchOrderDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/user/pesanan/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order detail', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="h-64 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p>Pesanan tidak ditemukan</p>
      </div>
    );
  }

  const currentStep = getStatusStep(order.statusPesanan);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/pesanan-saya" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pesanan Saya
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900">Detail Pesanan</h1>
            <div className="text-slate-500">
              Kode: <span className="font-mono font-medium text-slate-900">{order.kodePesanan}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Status & Items */}
          <div className="flex-1 space-y-8">
            {/* Status Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Status Pesanan</h2>
              <div className="relative flex justify-between">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
                {/* Progress Bar Active */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />

                {['Menunggu', 'Diproses', 'Dikirim', 'Selesai'].map((step, index) => (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      index <= currentStep 
                        ? 'bg-amber-500 border-amber-500 text-white' 
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-xs font-medium ${
                      index <= currentStep ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              
              {order.statusPesanan === 'dibatalkan' && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center font-medium">
                  Pesanan Dibatalkan
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Daftar Produk</h2>
              <div className="space-y-4">
                {order.detailPesanan.map((item) => (
                  <div key={item.idDetail} className="flex gap-4 py-4 border-b border-slate-100 last:border-0">
                    <div className="w-16 h-24 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {item.buku.coverUrl && (
                        <img src={item.buku.coverUrl} alt={item.buku.judul} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/buku/${item.buku.idBuku}`}>
                        <h3 className="font-medium text-slate-900 hover:text-amber-600 transition-colors">
                          {item.buku.judul}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.jumlah} x Rp {parseFloat(item.hargaSatuan).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right font-medium text-slate-900">
                      Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Info & Payment */}
          <div className="w-full lg:w-1/3 space-y-8">
            {/* Shipping Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Info Pengiriman
              </h2>
              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{order.alamatUser.namaPenerima}</p>
                <p>{order.alamatUser.nomorTelepon}</p>
                <p>{order.alamatUser.alamatLengkap}</p>
                <p>{order.alamatUser.kota}, {order.alamatUser.provinsi} {order.alamatUser.kodePos}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                Rincian Pembayaran
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Metode</span>
                  <span className="font-medium capitalize">{order.metodePembayaran.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Status</span>
                  <span className="font-medium capitalize">{order.statusPembayaran.replace('_', ' ')}</span>
                </div>
                <div className="border-t border-slate-100 my-2" />
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>Rp {parseFloat(order.subtotal).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkir</span>
                  <span>Rp {parseFloat(order.ongkir).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pajak</span>
                  <span>Rp {parseFloat(order.pajakNominal).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-100">
                  <span>Total Bayar</span>
                  <span>Rp {parseFloat(order.totalBayar).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {order.metodePembayaran !== 'cod' && order.statusPembayaran === 'belum_dibayar' && (
                <Link
                  href={`/pesanan-saya/${order.idPesanan}/upload-bukti`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Bukti Pembayaran
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
