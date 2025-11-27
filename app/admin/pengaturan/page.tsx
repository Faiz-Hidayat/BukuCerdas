"use client";

import React, { useState, useEffect } from "react";
import { Save, Image as ImageIcon, CreditCard, Percent, Upload, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PengaturanPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        pajakPersen: 11,
        nomorRekening: "",
        nomorEwallet: "",
        qrisUrl: "",
        aktifCOD: true,
        aktifTransfer: true,
        aktifEwallet: true,
        aktifQRIS: true,
    });
    const [qrisFile, setQrisFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/pengaturan");
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    pajakPersen: Number(data.pajakPersen),
                    nomorRekening: data.nomorRekening || "",
                    nomorEwallet: data.nomorEwallet || "",
                    qrisUrl: data.qrisUrl || "",
                    aktifCOD: data.aktifCOD ?? true,
                    aktifTransfer: data.aktifTransfer ?? true,
                    aktifEwallet: data.aktifEwallet ?? true,
                    aktifQRIS: data.aktifQRIS ?? true,
                });
                setPreviewUrl(data.qrisUrl);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setQrisFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        const data = new FormData();
        data.append("pajakPersen", formData.pajakPersen.toString());
        data.append("nomorRekening", formData.nomorRekening);
        data.append("nomorEwallet", formData.nomorEwallet);
        data.append("qrisUrl", formData.qrisUrl);
        data.append("aktifCOD", formData.aktifCOD.toString());
        data.append("aktifTransfer", formData.aktifTransfer.toString());
        data.append("aktifEwallet", formData.aktifEwallet.toString());
        data.append("aktifQRIS", formData.aktifQRIS.toString());

        if (qrisFile) {
            data.append("qrisImage", qrisFile);
        }

        try {
            const res = await fetch("/api/admin/pengaturan", {
                method: "PUT",
                body: data,
            });

            if (res.ok) {
                setSuccess(true);
                fetchSettings();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert("Gagal menyimpan pengaturan");
            }
        } catch (error) {
            console.error("Error saving settings", error);
        } finally {
            setSaving(false);
        }
    };

    const ToggleSwitch = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-medium text-slate-700">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    checked ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
            >
                <span
                    className={`${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Memuat pengaturan...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-indigo-600">
                        Pengaturan Toko
                    </h2>
                    <p className="text-slate-500 mt-1">Kelola pajak, metode pembayaran, dan informasi toko.</p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Tax Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <Percent className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">Pajak & Biaya</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Pajak PPN (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            required
                                            value={formData.pajakPersen}
                                            onChange={(e) => setFormData({ ...formData, pajakPersen: parseFloat(e.target.value) })}
                                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-lg"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                        Persentase pajak yang akan ditambahkan secara otomatis pada setiap transaksi pembelian buku.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Payment Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">Metode Pembayaran</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Payment Method Toggles */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <ToggleSwitch 
                                        label="Cash On Delivery (COD)" 
                                        checked={formData.aktifCOD} 
                                        onChange={(val) => setFormData({...formData, aktifCOD: val})} 
                                    />
                                    <ToggleSwitch 
                                        label="Transfer Bank" 
                                        checked={formData.aktifTransfer} 
                                        onChange={(val) => setFormData({...formData, aktifTransfer: val})} 
                                    />
                                    <ToggleSwitch 
                                        label="E-Wallet" 
                                        checked={formData.aktifEwallet} 
                                        onChange={(val) => setFormData({...formData, aktifEwallet: val})} 
                                    />
                                    <ToggleSwitch 
                                        label="QRIS" 
                                        checked={formData.aktifQRIS} 
                                        onChange={(val) => setFormData({...formData, aktifQRIS: val})} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Rekening Bank</label>
                                        <input
                                            type="text"
                                            value={formData.nomorRekening}
                                            onChange={(e) => setFormData({ ...formData, nomorRekening: e.target.value })}
                                            disabled={!formData.aktifTransfer}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Contoh: BCA 1234567890 a.n. BukuCerdas"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Nomor E-Wallet</label>
                                        <input
                                            type="text"
                                            value={formData.nomorEwallet}
                                            onChange={(e) => setFormData({ ...formData, nomorEwallet: e.target.value })}
                                            disabled={!formData.aktifEwallet}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Contoh: OVO/Gopay 081234567890"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-sm font-medium text-slate-700 mb-4">QRIS Code (Scan Payment)</label>
                                    <div className={`flex flex-col sm:flex-row items-start gap-6 ${!formData.aktifQRIS ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="w-40 h-40 bg-slate-100 rounded-2xl overflow-hidden relative border-2 border-dashed border-slate-300 shrink-0 group">
                                            {previewUrl ? (
                                                <Image
                                                    src={previewUrl}
                                                    alt="QRIS Preview"
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                    <ImageIcon className="w-8 h-8 mb-2" />
                                                    <span className="text-xs">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                                Preview
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="qris-upload"
                                                />
                                                <label
                                                    htmlFor="qris-upload"
                                                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer shadow-sm group">
                                                    <Upload className="w-4 h-4 group-hover:text-indigo-600 transition-colors" />
                                                    <span>Upload Gambar QRIS Baru</span>
                                                </label>
                                            </div>
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                Unggah gambar QRIS resmi toko Anda. Gambar ini akan ditampilkan kepada pembeli saat memilih
                                                metode pembayaran QRIS. Format: JPG, PNG. Max: 2MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-end gap-4 pt-4">
                    {success && (
                        <span className="text-emerald-600 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Pengaturan berhasil disimpan!
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </button>
                </motion.div>
            </form>
        </div>
    );
}
