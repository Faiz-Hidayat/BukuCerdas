'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, CheckCircle, XCircle, Truck, Package, AlertCircle, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Invoice from './Invoice';
import { toast } from 'sonner';

interface OrderDetail {
  idPesanan: number;
  kodePesanan: string;
  tanggalPesan: string;
  statusPembayaran: string;
  statusPesanan: string;
  metodePembayaran: string;
  subtotal: string;
  ongkir: string;
  pajakNominal: string;
  totalBayar: string;
  buktiPembayaranUrl: string | null;
  alasanPembatalan: string | null;
  resi: string | null;
  user: {
    namaLengkap: string;
    email: string;
    nomorTelepon: string;
  };
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
      judul: string;
      coverUrl: string | null;
    };
  }[];
}

import { VALID_TRANSITIONS } from '../../../../lib/pesanan-status';

export default function DetailPesananPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPrintMode = searchParams.get('print') === 'true';

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resiInput, setResiInput] = useState('');
  const [statusSelect, setStatusSelect] = useState('');

  // state for cancellation modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [pendingCancelPayload, setPendingCancelPayload] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (order) {
      setStatusSelect(order.statusPesanan);
      setResiInput(order.resi || '');
    }
  }, [order]);

  useEffect(() => {
    if (isPrintMode && order && !loading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [isPrintMode, order, loading]);

  const fetchOrder = async (id: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/admin/pesanan/${id}`);
      if (!res.ok) {
         throw new Error('Pesanan tidak ditemukan atau gagal dimuat');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      console.error('Failed to fetch order', err);
      setError(err.message || 'Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (payload: { statusPembayaran?: string; statusPesanan?: string; alasanPembatalan?: string }) => {
    if (!order) return;

    if (payload.statusPesanan === 'dibatalkan') {
      setPendingCancelPayload(payload);
      setIsCancelModalOpen(true);
      return;
    }

    const valueLabel = payload.statusPembayaran || payload.statusPesanan;
    toast(`Ubah status menjadi ${valueLabel}?`, {
      action: {
        label: 'Ubah',
        onClick: async () => {
          try {
            const res = await fetch(`/api/admin/pesanan/${order.idPesanan}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              fetchOrder(order.idPesanan.toString());
              toast.success('Status berhasil diubah');
            } else {
              const err = await res.json();
              toast.error(err.error || 'Gagal mengupdate status');
            }
          } catch (error) {
            console.error('Error updating status', error);
          }
        },
      },
      cancel: { label: 'Batal', onClick: () => {} },
    });
  };

  const submitCancelAction = async () => {
    if (!order || !pendingCancelPayload) return;
    if (!cancelReasonInput.trim()) {
      toast.error('Alasan pembatalan wajid diisi');
      return;
    }

    const body = {
      ...pendingCancelPayload,
      alasanPembatalan: cancelReasonInput,
    };

    try {
      const res = await fetch(`/api/admin/pesanan/${order.idPesanan}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchOrder(order.idPesanan.toString());
        toast.success('Pesanan berhasil dibatalkan');
        setIsCancelModalOpen(false);
        setCancelReasonInput('');
        setPendingCancelPayload(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal membatalkan pesanan');
      }
    } catch (error) {
      console.error('Error cancelling order', error);
    }
  };

  const handleUpdatePengiriman = async () => {
    if (!order) return;
    if (statusSelect === 'dikirim' && !resiInput && !order.resi) {
      toast.error('Nomor resi wajib diisi sebelum pesanan dikirim');
      return;
    }

    if (statusSelect === 'dibatalkan') {
      setPendingCancelPayload({ statusPesanan: statusSelect });
      setIsCancelModalOpen(true);
      return;
    }

    toast(`Ubah status pengiriman menjadi ${statusSelect.replace('_', ' ').toUpperCase()}?`, {
      action: {
        label: 'Simpan',
        onClick: async () => {
          try {
            const body: any = { statusPesanan: statusSelect };
            if (statusSelect === 'dikirim') {
              body.resi = resiInput || order.resi;
            }

            const res = await fetch(`/api/admin/pesanan/${order.idPesanan}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (res.ok) {
              fetchOrder(order.idPesanan.toString());
              toast.success('Status pengiriman berhasil diupdate');
            } else {
              const err = await res.json();
              toast.error(err.error || 'Gagal mengupdate status');
            }
          } catch (error) {
            console.error('Error updating status', error);
          }
        },
      },
      cancel: { label: 'Batal', onClick: () => {} },
    });
  };

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(val));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex animate-pulse items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
            <div>
              <div className="h-6 w-48 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="w-32 h-10 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-6">
             <div className="h-[400px] bg-slate-200 rounded-xl" />
          </div>
          <div className="space-y-6">
             <div className="h-[200px] bg-slate-200 rounded-xl" />
             <div className="h-[300px] bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-100">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Pesanan</h3>
        <p className="text-slate-500 mb-6">{error || 'Pesanan tidak ditemukan'}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium">
          <RefreshCcw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/pesanan" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Detail Pesanan #{order.kodePesanan}</h2>
              <p className="text-slate-500">
                {new Date(order.tanggalPesan).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
            <Printer className="w-4 h-4" />
            Cetak Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Item Pesanan</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {order.detailPesanan.map((item) => (
                  <div key={item.idDetail} className="p-4 flex gap-4">
                    <div className="w-16 h-24 bg-slate-100 rounded overflow-hidden relative shrink-0">
                      {item.buku.coverUrl ? (
                        <Image src={item.buku.coverUrl} alt={item.buku.judul} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No Cover
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{item.buku.judul}</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.jumlah} x {formatCurrency(item.hargaSatuan)}
                      </p>
                    </div>
                    <div className="text-right font-medium text-slate-900">{formatCurrency(item.subtotal)}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Ongkos Kirim</span>
                  <span>{formatCurrency(order.ongkir)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Pajak</span>
                  <span>{formatCurrency(order.pajakNominal)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Bayar</span>
                  <span>{formatCurrency(order.totalBayar)}</span>
                </div>
              </div>
            </div>

            {/* Payment Proof */}
            {order.buktiPembayaranUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Bukti Pembayaran</h3>
                </div>
                <div className="p-4">
                  <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
                    <Image src={order.buktiPembayaranUrl} alt="Bukti Pembayaran" fill className="object-contain" />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => updateStatus({ statusPembayaran: 'terkonfirmasi', statusPesanan: 'diproses' })}
                      disabled={order.statusPembayaran === 'terkonfirmasi'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <CheckCircle className="w-4 h-4" />
                      Konfirmasi Pembayaran
                    </button>
                    <button
                      onClick={() => updateStatus({ statusPembayaran: 'dibatalkan', statusPesanan: 'dibatalkan' })}
                      disabled={order.statusPembayaran === 'dibatalkan'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <XCircle className="w-4 h-4" />
                      Tolak / Batalkan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Status Pesanan</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Pembayaran</label>
                  <div
                    className={`mt-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                      order.statusPembayaran === 'terkonfirmasi'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : order.statusPembayaran === 'dibatalkan'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }`}>
                    {order.statusPembayaran.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                  {order.alasanPembatalan && (
                    <div>
                      <label className="text-xs font-medium text-red-500 uppercase">Alasan Batal</label>
                      <div className="mt-1 px-3 py-2 rounded-lg text-sm font-medium border bg-red-50 border-red-200 text-red-700">
                        {order.alasanPembatalan}
                      </div>
                    </div>
                  )}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Pengiriman</label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={statusSelect}
                      onChange={(e) => setStatusSelect(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                      <option value={order.statusPesanan}>{order.statusPesanan.replace(/_/g, ' ').toUpperCase()}</option>
                      {VALID_TRANSITIONS[order.statusPesanan]?.map((v) => (
                        <option key={v} value={v}>{v.replace(/_/g, ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  {statusSelect === 'dikirim' && (
                    <div className="mt-3">
                      <label className="text-xs font-medium text-slate-500">Nomor Resi</label>
                      <input 
                        type="text" 
                        value={resiInput} 
                        onChange={(e) => setResiInput(e.target.value)} 
                        placeholder="Masukkan nomor resi..."
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                  )}
                  {statusSelect !== order.statusPesanan && (
                    <button 
                      onClick={() => handleUpdatePengiriman()}
                      className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                      Simpan Pengiriman
                    </button>
                  )}
                  {order.statusPesanan === 'dikirim' && order.resi && statusSelect === order.statusPesanan && (
                    <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 break-all">
                      <span className="font-semibold text-slate-800">Resi:</span> {order.resi}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Informasi Pelanggan</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500">Nama</p>
                  <p className="font-medium text-slate-900">{order.user.namaLengkap}</p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">{order.user.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Telepon</p>
                  <p className="font-medium text-slate-900">{order.user.nomorTelepon || '-'}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Alamat Pengiriman</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500">Penerima</p>
                  <p className="font-medium text-slate-900">{order.alamatUser.namaPenerima}</p>
                </div>
                <div>
                  <p className="text-slate-500">Telepon</p>
                  <p className="font-medium text-slate-900">{order.alamatUser.nomorTelepon}</p>
                </div>
                <div>
                  <p className="text-slate-500">Alamat</p>
                  <p className="text-slate-900">{order.alamatUser.alamatLengkap}</p>
                  <p className="text-slate-900">
                    {order.alamatUser.kota}, {order.alamatUser.provinsi} {order.alamatUser.kodePos}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Invoice order={order} />
      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Alasan Pembatalan</h2>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <XCircle size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Silakan masukkan alasan pesanan ini dibatalkan. Alasan ini akan ditampilkan kepada customer.
            </p>
            <textarea
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-6"
              rows={4}
              placeholder="Contoh: Stok barang habis, atau alamat pengiriman tidak valid..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={submitCancelAction}
                disabled={!cancelReasonInput.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Konfirmasi Pembatalan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
