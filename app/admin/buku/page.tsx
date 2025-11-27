"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Search, Image as ImageIcon, Eye, EyeOff, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Book {
    idBuku: number;
    judul: string;
    pengarang: string;
    penerbit: string;
    tahunTerbit: number;
    isbn: string | null;
    stok: number;
    harga: string; // Decimal comes as string usually
    sinopsis: string | null;
    coverUrl: string | null;
    statusAktif: boolean;
    idKategori: number;
    kategoriBuku: {
        namaKategori: string;
    };
}

interface Category {
    idKategori: number;
    namaKategori: string;
}

export default function BukuPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        judul: "",
        pengarang: "",
        penerbit: "",
        tahunTerbit: new Date().getFullYear(),
        isbn: "",
        stok: 0,
        harga: 0,
        sinopsis: "",
        idKategori: 0,
        coverUrl: "",
        statusAktif: true,
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await fetch("/api/admin/buku");
            if (res.ok) {
                const data = await res.json();
                setBooks(data);
            }
        } catch (error) {
            console.error("Failed to fetch books", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/kategori-buku");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append("judul", formData.judul);
        data.append("pengarang", formData.pengarang);
        data.append("penerbit", formData.penerbit);
        data.append("tahunTerbit", formData.tahunTerbit.toString());
        data.append("isbn", formData.isbn);
        data.append("stok", formData.stok.toString());
        data.append("harga", formData.harga.toString());
        data.append("sinopsis", formData.sinopsis);
        data.append("idKategori", formData.idKategori.toString());
        data.append("statusAktif", formData.statusAktif.toString());
        data.append("coverUrl", formData.coverUrl); // Send existing URL if no new file

        if (coverFile) {
            data.append("coverImage", coverFile);
        }

        try {
            const url = editingBook ? `/api/admin/buku/${editingBook.idBuku}` : "/api/admin/buku";

            const method = editingBook ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: data,
            });

            if (res.ok) {
                fetchBooks();
                closeModal();
            } else {
                const err = await res.json();
                alert(err.error || "Gagal menyimpan buku");
            }
        } catch (error) {
            console.error("Error saving book", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menonaktifkan buku ini?")) return;

        try {
            const res = await fetch(`/api/admin/buku/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchBooks();
            } else {
                alert("Gagal menghapus buku");
            }
        } catch (error) {
            console.error("Error deleting book", error);
        }
    };

    const openModal = (book?: Book) => {
        if (book) {
            setEditingBook(book);
            setFormData({
                judul: book.judul,
                pengarang: book.pengarang,
                penerbit: book.penerbit,
                tahunTerbit: book.tahunTerbit,
                isbn: book.isbn || "",
                stok: book.stok,
                harga: Number(book.harga),
                sinopsis: book.sinopsis || "",
                idKategori: book.idKategori,
                coverUrl: book.coverUrl || "",
                statusAktif: book.statusAktif,
            });
            setPreviewUrl(book.coverUrl);
        } else {
            setEditingBook(null);
            setFormData({
                judul: "",
                pengarang: "",
                penerbit: "",
                tahunTerbit: new Date().getFullYear(),
                isbn: "",
                stok: 0,
                harga: 0,
                sinopsis: "",
                idKategori: categories[0]?.idKategori || 0,
                coverUrl: "",
                statusAktif: true,
            });
            setPreviewUrl(null);
        }
        setCoverFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBook(null);
        setPreviewUrl(null);
    };

    const filteredBooks = books.filter((b) => {
        const matchesSearch =
            b.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.pengarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.isbn && b.isbn.includes(searchTerm));
        const matchesCategory = filterCategory === "all" || b.idKategori.toString() === filterCategory;
        const matchesStatus =
            filterStatus === "all" || (filterStatus === "active" ? b.statusAktif : !b.statusAktif);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Data Buku</h2>
                    <p className="text-slate-500 mt-1">Kelola katalog buku yang tersedia di toko Anda.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 font-medium">
                    <Plus className="w-5 h-5" />
                    Tambah Buku Baru
                </motion.button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari judul, pengarang, atau ISBN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors font-medium text-sm ${
                                showFilters
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}>
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden">
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="w-full sm:w-auto">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Kategori</label>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className="w-full sm:w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white">
                                            <option value="all">Semua Kategori</option>
                                            {categories.map((c) => (
                                                <option
                                                    key={c.idKategori}
                                                    value={c.idKategori}>
                                                    {c.namaKategori}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full sm:w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white">
                                            <option value="all">Semua Status</option>
                                            <option value="active">Aktif</option>
                                            <option value="inactive">Non-aktif</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-5 w-20">Cover</th>
                                <th className="px-6 py-5">Judul Buku</th>
                                <th className="px-6 py-5">Pengarang</th>
                                <th className="px-6 py-5">Tahun</th>
                                <th className="px-6 py-5">Kategori</th>
                                <th className="px-6 py-5 text-center">Stok</th>
                                <th className="px-6 py-5">Harga</th>
                                <th className="px-6 py-5 text-center">Status</th>
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
                                            <div className="w-12 h-16 bg-slate-200 rounded-lg"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-4 bg-slate-200 rounded w-12"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-4 bg-slate-200 rounded w-20"></div>
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
                            ) : filteredBooks.length > 0 ? (
                                filteredBooks.map((book) => (
                                    <tr
                                        key={book.idBuku}
                                        className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="w-12 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0 relative shadow-sm group-hover:shadow-md transition-shadow">
                                                {book.coverUrl ? (
                                                    <Image
                                                        src={book.coverUrl}
                                                        alt={book.judul}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-semibold text-slate-900 max-w-[200px] truncate" title={book.judul}>
                                            {book.judul}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600">
                                            {book.pengarang}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600">
                                            {book.tahunTerbit}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {book.kategoriBuku?.namaKategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`font-medium ${book.stok < 5 ? "text-red-600" : "text-slate-600"}`}>
                                                {book.stok}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-900 font-bold">{formatCurrency(book.harga)}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                                    book.statusAktif
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                                }`}>
                                                {book.statusAktif ? "Aktif" : "Non-aktif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(book)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book.idBuku)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title={book.statusAktif ? "Nonaktifkan" : "Aktifkan"}>
                                                    {book.statusAktif ? <Trash2 className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 text-slate-300" />
                                            <p>Tidak ada buku ditemukan.</p>
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{editingBook ? "Edit Buku" : "Tambah Buku Baru"}</h3>
                                    <p className="text-sm text-slate-500 mt-1">Lengkapi informasi buku di bawah ini.</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-8 space-y-8 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    {/* Left Column - Image */}
                                    <div className="md:col-span-4 space-y-4">
                                        <label className="block text-sm font-semibold text-slate-700">Cover Buku</label>
                                        <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden relative border-2 border-dashed border-slate-300 hover:border-amber-500 transition-colors group cursor-pointer">
                                            {previewUrl ? (
                                                <Image
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                                    <ImageIcon className="w-8 h-8" />
                                                    <span className="text-xs font-medium">Upload Cover</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs text-slate-500 text-center">Atau gunakan URL gambar</p>
                                            <input
                                                type="text"
                                                value={formData.coverUrl}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, coverUrl: e.target.value });
                                                    if (!coverFile) setPreviewUrl(e.target.value);
                                                }}
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column - Details */}
                                    <div className="md:col-span-8 space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Buku</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.judul}
                                                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                    placeholder="Masukkan judul buku lengkap"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pengarang</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.pengarang}
                                                        onChange={(e) => setFormData({ ...formData, pengarang: e.target.value })}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Penerbit</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.penerbit}
                                                        onChange={(e) => setFormData({ ...formData, penerbit: e.target.value })}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tahun</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.tahunTerbit}
                                                        onChange={(e) => setFormData({ ...formData, tahunTerbit: parseInt(e.target.value) })}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ISBN</label>
                                                    <input
                                                        type="text"
                                                        value={formData.isbn}
                                                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
                                                <select
                                                    required
                                                    value={formData.idKategori}
                                                    onChange={(e) => setFormData({ ...formData, idKategori: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white">
                                                    <option
                                                        value={0}
                                                        disabled>
                                                        Pilih Kategori
                                                    </option>
                                                    {categories.map((c) => (
                                                        <option
                                                            key={c.idKategori}
                                                            value={c.idKategori}>
                                                            {c.namaKategori}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga (Rp)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                            Rp
                                                        </span>
                                                        <input
                                                            type="number"
                                                            required
                                                            value={formData.harga}
                                                            onChange={(e) => setFormData({ ...formData, harga: parseFloat(e.target.value) })}
                                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stok</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={formData.stok}
                                                        onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) })}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sinopsis</label>
                                    <textarea
                                        value={formData.sinopsis}
                                        onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[120px]"
                                        placeholder="Tuliskan sinopsis buku..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <input
                                        type="checkbox"
                                        id="statusAktif"
                                        checked={formData.statusAktif}
                                        onChange={(e) => setFormData({ ...formData, statusAktif: e.target.checked })}
                                        className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                                    />
                                    <div>
                                        <label
                                            htmlFor="statusAktif"
                                            className="text-sm font-semibold text-slate-800 block">
                                            Status Aktif
                                        </label>
                                        <p className="text-xs text-slate-500">Buku akan ditampilkan di katalog jika aktif.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium">
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-lg shadow-amber-600/20">
                                        Simpan Buku
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
