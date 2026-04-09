'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, X, Search, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Pagination from '../../_components/Pagination';
import { toast } from 'sonner';

interface TarifOngkir {
  idTarif: number;
  kotaTujuan: string;
  zona: string;
  biayaOngkir: number | string;
}

function TarifOngkirContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<TarifOngkir[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TarifOngkir | null>(null);
  const [formData, setFormData] = useState({ kotaTujuan: '', zona: '', biayaOngkir: '' });
  
  const initialSearch = searchParams.get('search') || '';
  const initialPage = Number(searchParams.get('page')) || 1;
  const [searchTermInput, setSearchTermInput] = useState(initialSearch);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/tarif-ongkir?page=${currentPage}&limit=10&search=${encodeURIComponent(searchTerm)}`
      );
      if (res.ok) {
        const json = await res.json();
        setItems(json.data);
        setTotalPages(json.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch tarif ongkir', error);
      toast.error('Gagal mengambil data tarif ongkir');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', String(currentPage));
    if (searchTerm) params.set('search', searchTerm);
    const qs = params.toString();
    router.replace(`/admin/tarif-ongkir${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [currentPage, searchTerm, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTerm(searchTermInput);
  };

  const openModal = (item?: TarifOngkir) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        kotaTujuan: item.kotaTujuan,
        zona: item.zona,
        biayaOngkir: String(item.biayaOngkir),
      });
    } else {
      setEditingItem(null);
      setFormData({ kotaTujuan: '', zona: '', biayaOngkir: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ kotaTujuan: '', zona: '', biayaOngkir: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kotaTujuan || !formData.zona || !formData.biayaOngkir) {
      toast.error('Mohon isi semua field yang wajib');
      return;
    }

    try {
      const url = editingItem
        ? `/api/admin/tarif-ongkir/${editingItem.idTarif}`
        : '/api/admin/tarif-ongkir';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kotaTujuan: formData.kotaTujuan,
          zona: formData.zona,
          biayaOngkir: Number(formData.biayaOngkir),
        }),
      });

      if (res.ok) {
        toast.success(editingItem ? 'Tarif ongkir berhasil diperbarui' : 'Tarif ongkir berhasil ditambahkan');
        fetchItems();
        closeModal();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menyimpan tarif ongkir');
      }
    } catch (error) {
      console.error('Error saving tarif ongkir', error);
      toast.error('Terjadi kesalahan pada server');
    }
  };

  const handleDelete = async (id: number) => {
    toast('Yakin ingin menghapus tarif ongkir ini?', {
      action: {
        label: 'Hapus',
        onClick: async () => {
          try {
            const res = await fetch(`/api/admin/tarif-ongkir/${id}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              fetchItems();
              toast.success('Tarif ongkir berhasil dihapus');
            } else {
              toast.error('Gagal menghapus tarif ongkir');
            }
          } catch (error) {
            toast.error('Terjadi kesalahan');
          }
        },
      },
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
            <Truck className="w-8 h-8 text-amber-600" />
            Manajemen Tarif Ongkir
          </h1>
          <p className="text-slate-500 mt-1">Kelola daftar wilayah, zona, dan biaya pengiriman</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-amber-600/20"
        >
          <Plus size={20} />
          Tambah Tarif
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari kota tujuan..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600 uppercase tracking-wider">
                <th className="p-4 font-semibold">Kota Tujuan</th>
                <th className="p-4 font-semibold">Zona</th>
                <th className="p-4 font-semibold">Biaya Ongkir (Rp)</th>
                <th className="p-4 font-semibold text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-t-amber-500 border-amber-200 rounded-full animate-spin" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <Truck className="w-12 h-12 text-slate-200 mb-3" />
                    <p>Tidak ada data tarif ongkir yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.idTarif}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-900">{item.kotaTujuan}</div>
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {item.zona}
                      </span>
                    </td>
                    <td className="p-4 align-top text-slate-700 font-medium">
                      Rp {Number(item.biayaOngkir).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.idTarif)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-end">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center"
            >
              <div
                onClick={closeModal}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-md m-4 sm:m-6 bg-white rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  {editingItem ? 'Edit Tarif Ongkir' : 'Tambah Tarif Ongkir'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kota Tujuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kotaTujuan}
                    onChange={(e) => setFormData({ ...formData, kotaTujuan: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
                    placeholder="Contoh: Jakarta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Zona <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zona}
                    onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
                    placeholder="Contoh: Jawa 1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Biaya Ongkir (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.biayaOngkir}
                    onChange={(e) => setFormData({ ...formData, biayaOngkir: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-sm shadow-amber-600/20 transition-all active:scale-[0.98] font-medium"
                  >
                    {editingItem ? 'Simpan Perubahan' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>
      , document.body)}
    </div>
  );
}

export default function TarifOngkirPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat...</div>}>
      <TarifOngkirContent />
    </Suspense>
  );
}
