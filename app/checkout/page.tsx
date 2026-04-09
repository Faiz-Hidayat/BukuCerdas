'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Navbar from '../(marketing)/_components/Navbar';
import Footer from '../(marketing)/_components/Footer';
import { MapPin, CreditCard, Truck, CheckCircle, Plus, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Midtrans Snap global type
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

interface Address {
  idAlamat: number;
  namaPenerima: string;
  nomorTelepon: string;
  kota: string;
  provinsi: string;
  alamatLengkap: string;
  kodePos: string;
  isDefault: boolean;
}

interface CartItem {
  idItem: number;
  jumlah: number;
  buku: {
    idBuku: number;
    judul: string;
    harga: string;
    coverUrl: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('transfer_bank');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [ongkir, setOngkir] = useState(0);
  const [pajakPersen, setPajakPersen] = useState(11);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    namaPenerima: '',
    nomorTelepon: '',
    kota: '',
    provinsi: '',
    alamatLengkap: '',
    kodePos: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAddressId) {
      const address = addresses.find((a) => a.idAlamat === selectedAddressId);
      if (address) {
        calculateOngkir(address.kota);
      }
    }
  }, [selectedAddressId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Dapatkan item yang dipilih dari URL
      const searchParams = new URLSearchParams(window.location.search);
      const itemsParam = searchParams.get('items');
      const selectedItemIds = itemsParam ? itemsParam.split(',').map(Number) : [];

      const [cartRes, addrRes, settingsRes] = await Promise.all([
        fetch('/api/keranjang'),
        fetch('/api/user/alamat'),
        fetch('/api/pengaturan'), // Public endpoint
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        let items = cartData.itemKeranjang || [];
        
        // Filter item berdasarkan yang dipilih dari keranjang
        if (selectedItemIds.length > 0) {
          items = items.filter((item: CartItem) => selectedItemIds.includes(item.idItem));
        }

        if (items.length === 0) {
          router.push('/keranjang');
          return;
        }
        setCartItems(items);
      } else if (cartRes.status === 401) {
        router.push('/login');
        return;
      } else {
        throw new Error('Gagal memuat keranjang');
      }

      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData);
        if (addrData.length > 0) {
          const defaultAddr = addrData.find((a: Address) => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr.idAlamat : addrData[0].idAlamat);
        } else {
          setShowAddressForm(true);
        }
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData && settingsData.pajakPersen) {
          setPajakPersen(Number(settingsData.pajakPersen));
        }
      }
    } catch (error) {
      console.error('Error fetching checkout data', error);
      setError('Gagal memuat data checkout. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const calculateOngkir = async (kota: string) => {
    try {
      const res = await fetch('/api/ongkir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kota }),
      });
      if (res.ok) {
        const data = await res.json();
        setOngkir(data.ongkir);
      }
    } catch (error) {
      console.error('Error calculating ongkir', error);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/alamat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses([...addresses, data]);
        setSelectedAddressId(data.idAlamat);
        setShowAddressForm(false);
        setNewAddress({
          namaPenerima: '',
          nomorTelepon: '',
          kota: '',
          provinsi: '',
          alamatLengkap: '',
          kodePos: '',
        });
      }
    } catch (error) {
      console.error('Error adding address', error);
    }
  };

  // Midtrans Snap: buka popup pembayaran
  const openMidtransSnap = useCallback(
    async (idPesanan: number) => {
      try {
        const res = await fetch('/api/payment/midtrans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idPesanan }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || 'Gagal membuat token pembayaran');
          router.push(`/pesanan-saya/${idPesanan}`);
          return;
        }

        const { snapToken } = await res.json();

        if (!window.snap) {
          toast.error('Midtrans Snap belum siap, silakan coba lagi');
          router.push(`/pesanan-saya/${idPesanan}`);
          return;
        }

        // Helper: panggil check-status API untuk sinkronisasi status setelah Snap ditutup
        const syncPaymentStatus = async () => {
          try {
            const checkRes = await fetch('/api/payment/midtrans/check-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idPesanan }),
            });
            if (checkRes.ok) {
              const result = await checkRes.json();
              return result;
            }
          } catch (e) {
            console.error('Error syncing payment status:', e);
          }
          return null;
        };

        window.snap.pay(snapToken, {
          onSuccess: async () => {
            await syncPaymentStatus();
            toast.success('Pembayaran berhasil!');
            router.push(`/pesanan-saya/${idPesanan}`);
          },
          onPending: async () => {
            await syncPaymentStatus();
            toast.info('Pembayaran pending, silakan selesaikan pembayaran');
            router.push(`/pesanan-saya/${idPesanan}`);
          },
          onError: async () => {
            await syncPaymentStatus();
            toast.error('Pembayaran gagal');
            router.push(`/pesanan-saya/${idPesanan}`);
          },
          onClose: async () => {
            await syncPaymentStatus();
            toast.info('Pembayaran belum selesai. Anda bisa melanjutkan nanti.');
            router.push(`/pesanan-saya/${idPesanan}`);
          },
        });
      } catch (error) {
        console.error('Error opening Midtrans Snap:', error);
        toast.error('Terjadi kesalahan saat membuka pembayaran');
        router.push(`/pesanan-saya/${idPesanan}`);
      }
    },
    [router],
  );

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Silakan pilih alamat pengiriman');
      return;
    }
    setProcessing(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const itemsParam = searchParams.get('items');
      const selectedItemIds = itemsParam ? itemsParam.split(',').map(Number) : undefined;
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idAlamat: selectedAddressId,
          metodePembayaran: paymentMethod,
          selectedItems: selectedItemIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Jika metode midtrans → buka Midtrans Snap popup
          if (data.metodePembayaran === 'midtrans') {
            await openMidtransSnap(data.idPesanan);
          } else {
          router.push(`/pesanan-saya/${data.idPesanan}`);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal memproses pesanan');
      }
    } catch (error) {
      console.error('Error checkout', error);
      toast.error('Terjadi kesalahan saat checkout');
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.buku.harga) * item.jumlah, 0);
  const pajakNominal = (subtotal * pajakPersen) / 100;
  const totalBayar = subtotal + ongkir + pajakNominal;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 space-y-4">
              <div className="h-48 bg-slate-200 rounded-xl" />
              <div className="h-48 bg-slate-200 rounded-xl" />
            </div>
            <div className="w-full lg:w-1/3 space-y-4">
               <div className="h-64 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-32 pb-12 px-6 flex flex-col items-center flex-grow">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Checkout</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            <RefreshCcw className="w-5 h-5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      </div>
    );
  }

  // URL Midtrans Snap JS
  const midtransScriptUrl =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Load Midtrans Snap JS */}
      <Script
        src={midtransScriptUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
        strategy="lazyOnload"
      />
      <Navbar />

      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Address & Payment */}
          <div className="flex-1 space-y-8">
            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  Alamat Pengiriman
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-sm text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Tambah Alamat
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nama Penerima"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={newAddress.namaPenerima}
                      onChange={(e) => setNewAddress({ ...newAddress, namaPenerima: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Nomor Telepon"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={newAddress.nomorTelepon}
                      onChange={(e) => setNewAddress({ ...newAddress, nomorTelepon: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Kota"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={newAddress.kota}
                      onChange={(e) => setNewAddress({ ...newAddress, kota: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Provinsi"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={newAddress.provinsi}
                      onChange={(e) => setNewAddress({ ...newAddress, provinsi: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Kode Pos"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={newAddress.kodePos}
                      onChange={(e) => setNewAddress({ ...newAddress, kodePos: e.target.value })}
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Alamat Lengkap"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    rows={3}
                    value={newAddress.alamatLengkap}
                    onChange={(e) => setNewAddress({ ...newAddress, alamatLengkap: e.target.value })}
                    required
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                      Batal
                    </button>
                    <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                      Simpan Alamat
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.idAlamat}
                      onClick={() => setSelectedAddressId(addr.idAlamat)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr.idAlamat
                          ? 'border-amber-500 bg-amber-50/50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">{addr.namaPenerima}</p>
                          <p className="text-sm text-slate-600">{addr.nomorTelepon}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {addr.alamatLengkap}, {addr.kota}, {addr.provinsi} {addr.kodePos}
                          </p>
                        </div>
                        {selectedAddressId === addr.idAlamat && <CheckCircle className="w-5 h-5 text-amber-500" />}
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-slate-500 text-center py-4">Belum ada alamat tersimpan.</p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-amber-500" />
                Metode Pembayaran
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'transfer_bank', label: 'Transfer Bank (Manual)' },
                  { id: 'ewallet', label: 'E-Wallet (Manual)' },
                  { id: 'qris', label: 'QRIS (Manual)' },
                  { id: 'midtrans', label: 'Bayar Otomatis (Midtrans / Qris)' },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === method.id
                        ? 'border-amber-500 bg-amber-50/50 font-medium text-amber-900'
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                    {method.id === 'midtrans' && <CreditCard className="w-5 h-5 mb-1 text-indigo-500" />}
                    <span className="text-sm">{method.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.idItem} className="flex gap-3">
                    <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {item.buku.coverUrl && (
                        <img src={item.buku.coverUrl} alt={item.buku.judul} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-slate-900 line-clamp-1">{item.buku.judul}</p>
                      <p className="text-slate-500">
                        {item.jumlah} x Rp {parseFloat(item.buku.harga).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      Rp {(Number(item.buku.harga) * item.jumlah).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim</span>
                  <span>Rp {ongkir.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pajak ({pajakPersen}%)</span>
                  <span>Rp {pajakNominal.toLocaleString('id-ID')}</span>
                </div>
                  
                  {['transfer_bank', 'ewallet', 'qris'].includes(paymentMethod) && (
                    <div className="flex justify-between text-amber-600 text-sm mt-1">
                      <span>Kode Unik</span>
                      <span>+1 s/d +99 (dihitung setelah checkout)</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-900 font-bold text-lg pt-3 border-t border-slate-100">
                    <span>Total Estimasi Bayar</span>
                    <span>Rp {totalBayar.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {['transfer_bank', 'ewallet', 'qris'].includes(paymentMethod) && (
                  <p className="text-xs text-amber-600 mt-3 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold">*Penting:</span> Akan ditambahkan kode unik 2 digit pada total bayar Anda di invoice akhir untuk mempermudah verifikasi.
                  </p>
                )}

              <button
                onClick={handleCheckout}
                disabled={processing || !selectedAddressId}
                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Buat Pesanan'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

