'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../(marketing)/_components/Navbar';
import Footer from '../(marketing)/_components/Footer';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CartItem {
  idItem: number;
  jumlah: number;
  buku: {
    idBuku: number;
    judul: string;
    harga: string;
    coverUrl: string;
    stok: number;
  };
}

export default function KeranjangPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/keranjang');
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.itemKeranjang || []);
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching cart', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (idItem: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(idItem);
    try {
      const res = await fetch(`/api/keranjang/${idItem}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jumlah: newQuantity }),
      });
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.idItem === idItem ? { ...item, jumlah: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating cart', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (idItem: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    try {
      const res = await fetch(`/api/keranjang/${idItem}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.idItem !== idItem));
        window.location.reload(); // Update navbar count
      }
    } catch (error) {
      console.error('Error removing item', error);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.buku.harga) * item.jumlah,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="h-64 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Keranjang Belanja</h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 space-y-6">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.idItem}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-4 py-4 border-b border-slate-100 last:border-0"
                    >
                      <div className="w-20 h-28 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.buku.coverUrl ? (
                          <img
                            src={item.buku.coverUrl}
                            alt={item.buku.judul}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No Cover
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link href={`/buku/${item.buku.idBuku}`}>
                            <h3 className="font-semibold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1">
                              {item.buku.judul}
                            </h3>
                          </Link>
                          <p className="text-amber-600 font-medium mt-1">
                            Rp {parseFloat(item.buku.harga).toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.idItem, item.jumlah - 1)}
                              disabled={item.jumlah <= 1 || updating === item.idItem}
                              className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4 text-slate-600" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.jumlah}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.idItem, item.jumlah + 1)}
                              disabled={item.jumlah >= item.buku.stok || updating === item.idItem}
                              className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.idItem)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2"
                            title="Hapus Item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Ringkasan Belanja</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Item</span>
                    <span>{cartItems.reduce((acc, item) => acc + item.jumlah, 0)} barang</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-lg pt-3 border-t border-slate-100">
                    <span>Total Harga</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    *Ongkir dan pajak akan dihitung saat checkout
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Lanjut ke Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Keranjang Belanja Kosong</h2>
            <p className="text-slate-500 mb-8">Wah, keranjangmu masih kosong nih. Yuk cari buku favoritmu!</p>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-600 transition-colors"
            >
              Cari Buku
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
