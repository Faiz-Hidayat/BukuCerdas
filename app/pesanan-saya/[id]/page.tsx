'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../(marketing)/_components/Navbar';
import Footer from '../../(marketing)/_components/Footer';
import {
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  Upload,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Banknote,
  QrCode,
  Image as ImageIcon,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

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
  resi: string | null;
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

interface PengaturanToko {
  nomorRekening: string | null;
  nomorEwallet: string | null;
  qrisUrl: string | null;
}

// Urutan status untuk tracking timeline
const TRACKING_STEPS = [
  {
    key: 'menunggu_pembayaran',
    label: 'Menunggu Pembayaran',
    icon: Clock,
    description: 'Pesanan dibuat, menunggu pembayaran',
  },
  {
    key: 'menunggu_verifikasi',
    label: 'Verifikasi Pembayaran',
    icon: Banknote,
    description: 'Bukti pembayaran dikirim, menunggu verifikasi admin',
  },
  {
    key: 'diproses',
    label: 'Diproses',
    icon: Package,
    description: 'Pembayaran dikonfirmasi, pesanan sedang diproses',
  },
  { key: 'dikirim', label: 'Dikirim', icon: Truck, description: 'Pesanan dalam pengiriman' },
  { key: 'selesai', label: 'Selesai', icon: CheckCircle, description: 'Pesanan telah diterima' },
];

// Untuk COD, tracking berbeda (tidak ada step pembayaran)
const TRACKING_STEPS_COD = [
  {
    key: 'menunggu_konfirmasi',
    label: 'Menunggu Konfirmasi',
    icon: Clock,
    description: 'Pesanan dibuat, menunggu konfirmasi admin',
  },
  { key: 'diproses', label: 'Diproses', icon: Package, description: 'Pesanan sedang diproses' },
  { key: 'dikirim', label: 'Dikirim', icon: Truck, description: 'Pesanan dalam pengiriman' },
  { key: 'selesai', label: 'Selesai', icon: CheckCircle, description: 'Pesanan diterima & dibayar' },
];

function getStepIndex(status: string, steps: typeof TRACKING_STEPS) {
  const idx = steps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pengaturan, setPengaturan] = useState<PengaturanToko | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetail(params.id as string);
      fetchPengaturan();
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

  const fetchPengaturan = async () => {
    try {
      const res = await fetch('/api/pengaturan');
      if (res.ok) {
        const data = await res.json();
        setPengaturan(data);
      }
    } catch {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Berhasil disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  // Cek status pembayaran Midtrans (untuk ewallet/qris yang masih pending)
  const handleCheckPaymentStatus = async () => {
    if (!order) return;
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/payment/midtrans/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPesanan: order.idPesanan }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.updated) {
          toast.success(result.message || 'Status pembayaran diperbarui');
          // Refresh data pesanan
          fetchOrderDetail(String(order.idPesanan));
        } else {
          toast.info(result.message || 'Status belum berubah');
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal mengecek status pembayaran');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Terjadi kesalahan saat mengecek status');
    } finally {
      setCheckingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 bg-slate-200 rounded-2xl" />
                <div className="h-64 bg-slate-200 rounded-2xl" />
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-slate-200 rounded-2xl" />
                <div className="h-64 bg-slate-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Pesanan tidak ditemukan</h2>
          <Link href="/pesanan-saya" className="text-amber-600 hover:text-amber-700 font-medium">
            Kembali ke Pesanan Saya
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isCOD = order.metodePembayaran === 'cod';
  const isMidtrans = order.metodePembayaran === 'ewallet' || order.metodePembayaran === 'qris';
  const isCancelled = order.statusPesanan === 'dibatalkan';
  const steps = isCOD ? TRACKING_STEPS_COD : TRACKING_STEPS;
  const currentStepIdx = getStepIndex(order.statusPesanan, steps);

  // Tampilkan tombol upload hanya untuk transfer_bank saat menunggu_pembayaran
  const showUploadButton = !isCOD && !isMidtrans && order.statusPesanan === 'menunggu_pembayaran';
  // Tampilkan tombol cek status Midtrans untuk ewallet/qris yang masih menunggu
  const showCheckMidtransButton = isMidtrans && order.statusPesanan === 'menunggu_pembayaran';
  // Tampilkan bukti yang sudah diupload saat menunggu_verifikasi
  const showUploadedProof =
    !isCOD && !isMidtrans && order.buktiPembayaranUrl && order.statusPesanan === 'menunggu_verifikasi';

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/pesanan-saya"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pesanan Saya
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Detail Pesanan</h1>
              <p className="text-slate-500 mt-1">
                Kode: <span className="font-mono font-semibold text-slate-700">{order.kodePesanan}</span>
                <span className="mx-2">·</span>
                {new Date(order.tanggalPesan).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tracking + Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Status Pesanan</h2>

              {isCancelled ? (
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700">Pesanan Dibatalkan</p>
                    <p className="text-sm text-red-600 mt-0.5">
                      Pesanan ini telah dibatalkan dan tidak dapat diproses lebih lanjut.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIdx;
                    const isCurrent = index === currentStepIdx;
                    const Icon = step.icon;
                    const isLast = index === steps.length - 1;

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {/* Vertical line */}
                        {!isLast && (
                          <div className="absolute left-5 top-10 bottom-0 w-0.5">
                            <div className={`h-full ${index < currentStepIdx ? 'bg-amber-400' : 'bg-slate-200'}`} />
                          </div>
                        )}

                        {/* Icon circle */}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                              : isCompleted
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 text-slate-400'
                          }`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                          <p
                            className={`font-semibold ${
                              isCurrent ? 'text-amber-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                            }`}>
                            {step.label}
                          </p>
                          <p className={`text-sm mt-0.5 ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                            {step.description}
                          </p>
                          {/* Resi info pada step dikirim */}
                          {step.key === 'dikirim' && isCompleted && order.resi && (
                            <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
                              <Truck className="w-4 h-4" />
                              No. Resi: <span className="font-mono font-semibold">{order.resi}</span>
                              <button
                                onClick={() => copyToClipboard(order.resi!)}
                                className="ml-1 p-0.5 hover:bg-blue-100 rounded transition-colors">
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Daftar Produk</h2>
              <div className="divide-y divide-slate-100">
                {order.detailPesanan.map((item) => (
                  <div key={item.idDetail} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-22 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.buku.coverUrl && (
                        <img src={item.buku.coverUrl} alt={item.buku.judul} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/buku/${item.buku.idBuku}`}>
                        <h3 className="font-medium text-slate-900 hover:text-amber-600 transition-colors truncate">
                          {item.buku.judul}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.jumlah} × Rp {parseFloat(item.hargaSatuan).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right font-semibold text-slate-900 whitespace-nowrap">
                      Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Info & Payment */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-500" />
                </div>
                Alamat Pengiriman
              </h2>
              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{order.alamatUser.namaPenerima}</p>
                <p>{order.alamatUser.nomorTelepon}</p>
                <p>{order.alamatUser.alamatLengkap}</p>
                <p>
                  {order.alamatUser.kota}, {order.alamatUser.provinsi} {order.alamatUser.kodePos}
                </p>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                </div>
                Informasi Pembayaran
              </h2>

              {/* Metode pembayaran badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    isCOD ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                  {isCOD ? (
                    <Banknote className="w-3.5 h-3.5" />
                  ) : order.metodePembayaran === 'qris' ? (
                    <QrCode className="w-3.5 h-3.5" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5" />
                  )}
                  {order.metodePembayaran === 'cod' && 'COD (Bayar di Tempat)'}
                  {order.metodePembayaran === 'transfer_bank' && 'Transfer Bank'}
                  {order.metodePembayaran === 'ewallet' && 'E-Wallet'}
                  {order.metodePembayaran === 'qris' && 'QRIS'}
                </span>
              </div>

              {/* Info khusus per metode */}
              {isCOD && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-sm text-green-700">
                  <p className="font-medium">Bayar saat barang diterima</p>
                  <p className="text-green-600 mt-1">
                    Siapkan uang pas sebesar{' '}
                    <span className="font-bold">Rp {parseFloat(order.totalBayar).toLocaleString('id-ID')}</span>
                  </p>
                </div>
              )}

              {order.metodePembayaran === 'transfer_bank' && pengaturan?.nomorRekening && showUploadButton && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700 space-y-2">
                  <p className="font-medium">Transfer ke rekening:</p>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-200">
                    <span className="font-mono font-bold text-blue-900">{pengaturan.nomorRekening}</span>
                    <button
                      onClick={() => copyToClipboard(pengaturan.nomorRekening!)}
                      className="p-1 hover:bg-blue-50 rounded transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {order.metodePembayaran === 'ewallet' && pengaturan?.nomorEwallet && showUploadButton && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-700 space-y-2">
                  <p className="font-medium">Transfer ke E-Wallet:</p>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-200">
                    <span className="font-mono font-bold text-purple-900">{pengaturan.nomorEwallet}</span>
                    <button
                      onClick={() => copyToClipboard(pengaturan.nomorEwallet!)}
                      className="p-1 hover:bg-purple-50 rounded transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {order.metodePembayaran === 'qris' && pengaturan?.qrisUrl && showUploadButton && (
                <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 text-sm text-violet-700 space-y-2">
                  <p className="font-medium">Scan QRIS untuk membayar:</p>
                  <div className="bg-white rounded-xl p-3 border border-violet-200 flex justify-center">
                    <img src={pengaturan.qrisUrl} alt="QRIS" className="max-w-[200px] w-full" />
                  </div>
                </div>
              )}

              {/* Info Midtrans untuk ewallet/qris */}
              {isMidtrans && showCheckMidtransButton && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-sm text-indigo-700 space-y-2">
                  <p className="font-medium">
                    Pembayaran via Midtrans ({order.metodePembayaran === 'ewallet' ? 'E-Wallet' : 'QRIS'})
                  </p>
                  <p className="text-indigo-600">
                    Jika Anda sudah menyelesaikan pembayaran, klik tombol di bawah untuk memperbarui status.
                  </p>
                </div>
              )}

              {isMidtrans && order.statusPembayaran === 'terkonfirmasi' && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <p className="font-medium">Pembayaran berhasil via Midtrans</p>
                  </div>
                </div>
              )}

              {/* Bukti yang sudah diupload */}
              {showUploadedProof && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm font-medium">Menunggu verifikasi admin</p>
                  </div>
                  <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                    <img
                      src={order.buktiPembayaranUrl!}
                      alt="Bukti Pembayaran"
                      className="w-full max-h-48 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Upload button — hanya untuk transfer_bank */}
              {showUploadButton && (
                <Link
                  href={`/pesanan-saya/${order.idPesanan}/upload-bukti`}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition-all hover:shadow-lg hover:-translate-y-0.5">
                  <Upload className="w-4 h-4" />
                  Upload Bukti Pembayaran
                </Link>
              )}

              {/* Cek status Midtrans — untuk ewallet/qris yang masih pending */}
              {showCheckMidtransButton && (
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={checkingStatus}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-500 text-white py-3 rounded-xl font-medium hover:bg-indigo-600 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  {checkingStatus ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengecek Status...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Cek Status Pembayaran
                    </>
                  )}
                </button>
              )}

              {/* Ringkasan biaya */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>Rp {parseFloat(order.subtotal).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ongkir</span>
                  <span>Rp {parseFloat(order.ongkir).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Pajak</span>
                  <span>Rp {parseFloat(order.pajakNominal).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-100">
                  <span>Total Bayar</span>
                  <span className="text-amber-600">Rp {parseFloat(order.totalBayar).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
