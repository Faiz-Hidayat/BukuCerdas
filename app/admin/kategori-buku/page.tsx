"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Search, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
    idKategori: number;
    namaKategori: string;
    deskripsi: string | null;
    _count?: {
        buku: number;
    };
}

export default function KategoriBukuPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ namaKategori: "", deskripsi: "" });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/kategori-buku");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingCategory ? `/api/admin/kategori-buku/${editingCategory.idKategori}` : "/api/admin/kategori-buku";

            const method = editingCategory ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchCategories();
                closeModal();
            } else {
                alert("Gagal menyimpan kategori");
            }
        } catch (error) {
            console.error("Error saving category", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

        try {
            const res = await fetch(`/api/admin/kategori-buku/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchCategories();
            } else {
                const data = await res.json();
                alert(data.error || "Gagal menghapus kategori");
            }
        } catch (error) {
            console.error("Error deleting category", error);
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                namaKategori: category.namaKategori,
                deskripsi: category.deskripsi || "",
            });
        } else {
            setEditingCategory(null);
            setFormData({ namaKategori: "", deskripsi: "" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ namaKategori: "", deskripsi: "" });
    };

    const filteredCategories = categories.filter((c) => c.namaKategori.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Kategori Buku</h2>
                    <p className="text-slate-500 mt-1">Kelola kategori buku untuk katalog toko.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 font-medium">
                    <Plus className="w-5 h-5" />
                    Tambah Kategori
                </motion.button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kategori..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-5 w-20">ID</th>
                                <th className="px-8 py-5">Nama Kategori</th>
                                <th className="px-6 py-5">Deskripsi</th>
                                <th className="px-6 py-5 text-center">Jumlah Buku</th>
                                <th className="px-6 py-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr
                                        key={i}
                                        className="animate-pulse">
                                        <td className="px-6 py-5">
                                            <div className="h-4 bg-slate-200 rounded w-8"></div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                                                <div className="h-4 bg-slate-200 rounded w-32"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-4 bg-slate-200 rounded w-48"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-6 bg-slate-200 rounded-full w-16 mx-auto"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                                                <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <tr
                                        key={category.idKategori}
                                        className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-5 text-slate-500 font-mono text-xs">
                                            #{category.idKategori}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                                    <Tag className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold text-slate-900 text-base">{category.namaKategori}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 max-w-xs truncate">{category.deskripsi || "-"}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                {category._count?.buku || 0} Buku
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(category)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.idKategori)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 text-slate-300" />
                                            <p>Tidak ada kategori ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Isi detail kategori buku.</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-8 space-y-6 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Kategori</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.namaKategori}
                                        onChange={(e) => setFormData({ ...formData, namaKategori: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        placeholder="Contoh: Fiksi, Sains, Sejarah"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi (Opsional)</label>
                                    <textarea
                                        value={formData.deskripsi}
                                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[120px]"
                                        placeholder="Deskripsi singkat kategori..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium">
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-lg shadow-amber-600/20">
                                        Simpan Kategori
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
