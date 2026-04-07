'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ShoppingCart, Star } from 'lucide-react';
import Navbar from '../(marketing)/_components/Navbar';
import Footer from '../(marketing)/_components/Footer';
import Pagination from '../_components/Pagination';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Book {
  idBuku: number;
  judul: string;
  pengarang: string;
  harga: string;
  coverUrl: string;
  rating: number;
  _count: {
    ulasanBuku: number;
  };
  kategoriBuku: {
    namaKategori: string;
  };
}

interface Category {
  idKategori: number;
  namaKategori: string;
}

function KatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'terbaru');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
    // Update URL tanpa reload
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy && sortBy !== 'terbaru') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    const qs = params.toString();
    router.replace(`/katalog${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [search, selectedCategory, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/kategori-buku');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const res = await fetch(`/api/buku?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setBooks(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching books', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (idBuku: number) => {
    try {
      const res = await fetch('/api/keranjang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idBuku, jumlah: 1 }),
      });
      if (res.ok) {
        toast.success('Berhasil ditambahkan ke keranjang');
        router.refresh();
      } else {
        const data = await res.json();
        if (res.status === 401) {
            router.push('/login');
        } else {
            toast.error(data.error || 'Gagal menambahkan ke keranjang');
        }
      }
    } catch (error) {
      console.error('Error adding to cart', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Katalog Buku</h1>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari judul atau pengarang..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.idKategori} value={cat.idKategori}>
                    {cat.namaKategori}
                  </option>
                ))}
              </select>
              
              <select
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              >
                <option value="terbaru">Terbaru</option>
                <option value="termurah">Termurah</option>
                <option value="terlaris">Terlaris</option>
              </select>
            </div>
          </div>
        </div>

        {/* Book Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 h-80 animate-pulse" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <motion.div
                key={book.idBuku}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Cover
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                
                <div className="p-4">
                  <div className="text-xs text-amber-600 font-medium mb-1">
                    {book.kategoriBuku.namaKategori}
                  </div>
                  <Link href={`/buku/${book.idBuku}`}>
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 hover:text-amber-600 transition-colors">
                      {book.judul}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-500 mb-2 line-clamp-1">{book.pengarang}</p>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-slate-700">{book.rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({book._count.ulasanBuku})</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-slate-900">
                      Rp {parseFloat(book.harga).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => addToCart(book.idBuku)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">Tidak ada buku yang ditemukan.</p>
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
      
      <Footer />
    </div>
  );
}

export default function KatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <KatalogContent />
    </Suspense>
  );
}
