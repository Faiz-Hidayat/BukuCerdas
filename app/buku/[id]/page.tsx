'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../(marketing)/_components/Navbar';
import Footer from '../../(marketing)/_components/Footer';
import { Star, ShoppingCart, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  idUlasan: number;
  rating: number;
  komentar: string;
  tanggalUlasan: string;
  user: {
    namaLengkap: string;
    fotoProfilUrl: string | null;
  };
}

interface BookDetail {
  idBuku: number;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahunTerbit: number;
  isbn: string;
  stok: number;
  harga: string;
  sinopsis: string;
  coverUrl: string;
  rating: number;
  kategoriBuku: {
    namaKategori: string;
  };
  ulasanBuku: Review[];
}

export default function BookDetailPage() {
  const params = useParams();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sinopsis' | 'detail' | 'ulasan'>('sinopsis');
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, komentar: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBookDetail(params.id as string);
      checkCanReview(params.id as string);
    }
  }, [params.id]);

  const checkCanReview = async (id: string) => {
    try {
      const res = await fetch(`/api/buku/${id}/check-purchase`);
      if (res.ok) {
        const data = await res.json();
        setCanReview(data.canReview);
      }
    } catch (error) {
      console.error('Error checking review status', error);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/buku/${book.idBuku}/ulasan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });

      if (res.ok) {
        alert('Ulasan berhasil dikirim!');
        setCanReview(false);
        fetchBookDetail(book.idBuku.toString());
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengirim ulasan');
      }
    } catch (error) {
      console.error('Error submitting review', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchBookDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/buku/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      }
    } catch (error) {
      console.error('Error fetching book detail', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!book) return;
    try {
      const res = await fetch('/api/keranjang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idBuku: book.idBuku, jumlah: 1 }),
      });
      if (res.ok) {
        alert('Berhasil ditambahkan ke keranjang');
        window.location.reload();
      } else {
        const data = await res.json();
        if (res.status === 401) {
            window.location.href = '/login';
        } else {
            alert(data.error || 'Gagal menambahkan ke keranjang');
        }
      }
    } catch (error) {
      console.error('Error adding to cart', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 h-[500px] bg-slate-200 rounded-xl" />
            <div className="w-full md:w-2/3 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-32 bg-slate-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p>Buku tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Column: Cover */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24"
            >
              <div className="aspect-[2/3] relative overflow-hidden group">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    No Cover
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="mb-6">
                <span className="text-amber-600 font-medium text-sm bg-amber-50 px-3 py-1 rounded-full">
                  {book.kategoriBuku.namaKategori}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-2">
                  {book.judul}
                </h1>
                <p className="text-lg text-slate-600 mb-4">
                  oleh <span className="font-semibold text-slate-800">{book.pengarang}</span>
                </p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg font-bold text-slate-900">{book.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">{book.ulasanBuku.length} Ulasan</span>
                  <span className="text-slate-300">|</span>
                  <span className={`${book.stok > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {book.stok > 0 ? `Stok: ${book.stok}` : 'Stok Habis'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-b border-slate-100 py-6 mb-6">
                  <div className="text-3xl font-bold text-slate-900">
                    Rp {parseFloat(book.harga).toLocaleString('id-ID')}
                  </div>
                  <button
                    onClick={addToCart}
                    disabled={book.stok === 0}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${
                      book.stok > 0
                        ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {book.stok > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-8">
                <div className="flex gap-8 border-b border-slate-200 mb-6">
                  {['sinopsis', 'detail', 'ulasan'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-4 text-sm font-medium capitalize transition-colors relative ${
                        activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="min-h-[200px]">
                  {activeTab === 'sinopsis' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
                    >
                      {book.sinopsis || 'Tidak ada sinopsis.'}
                    </motion.div>
                  )}

                  {activeTab === 'detail' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8"
                    >
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Penerbit</span>
                        <span className="font-medium text-slate-900">{book.penerbit}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Tahun Terbit</span>
                        <span className="font-medium text-slate-900">{book.tahunTerbit}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">ISBN</span>
                        <span className="font-medium text-slate-900">{book.isbn || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Kategori</span>
                        <span className="font-medium text-slate-900">{book.kategoriBuku.namaKategori}</span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'ulasan' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                      {canReview && (
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <h3 className="text-lg font-bold text-slate-900 mb-4">Tulis Ulasan Anda</h3>
                          <form onSubmit={submitReview} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`w-8 h-8 ${
                                        star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Komentar</label>
                              <textarea
                                value={reviewForm.komentar}
                                onChange={(e) => setReviewForm({ ...reviewForm, komentar: e.target.value })}
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                placeholder="Bagaimana pendapat Anda tentang buku ini?"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={submittingReview}
                              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
                            >
                              {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                            </button>
                          </form>
                        </div>
                      )}

                      <div className="space-y-6">
                        {book.ulasanBuku.length > 0 ? (
                        book.ulasanBuku.map((review) => (
                          <div key={review.idUlasan} className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                                  {review.user.fotoProfilUrl ? (
                                    <img src={review.user.fotoProfilUrl} alt={review.user.namaLengkap} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-4 h-4 text-slate-500" />
                                  )}
                                </div>
                                <span className="font-medium text-slate-900">{review.user.namaLengkap}</span>
                              </div>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(review.tanggalUlasan).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                                />
                              ))}
                            </div>
                            <p className="text-slate-600 text-sm">{review.komentar}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-8">Belum ada ulasan untuk buku ini.</p>
                      )}
                      </div>
                    </motion.div>
                  )}
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
