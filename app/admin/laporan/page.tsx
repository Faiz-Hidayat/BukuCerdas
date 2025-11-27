"use client";

import React, { useState, useEffect } from "react";
import { Calendar, DollarSign, ShoppingBag, Printer, TrendingUp, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";

interface ReportData {
    totalPendapatan: number;
    totalPesanan: number;
    chartData: { date: string; total: number }[];
    orders: any[];
}

export default function LaporanPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);

    // Set default dates (this month)
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setStartDate(firstDay.toISOString().split("T")[0]);
        setEndDate(lastDay.toISOString().split("T")[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchReport();
        }
    }, [startDate, endDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/laporan?startDate=${startDate}&endDate=${endDate}`);
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
            }
        } catch (error) {
            console.error("Failed to fetch report", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-indigo-600">
                        Laporan Penjualan
                    </h2>
                    <p className="text-slate-500 mt-1">Ringkasan pendapatan dan transaksi toko.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all shadow-sm hover:shadow-md font-medium">
                    <Printer className="w-4 h-4" />
                    Cetak Laporan
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <span>Periode Laporan:</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 bg-transparent text-sm focus:outline-none text-slate-700 font-medium"
                    />
                    <span className="text-slate-400 font-medium">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 bg-transparent text-sm focus:outline-none text-slate-700 font-medium"
                    />
                </div>
                <button
                    onClick={fetchReport}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95">
                    Terapkan Filter
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Sedang memproses data laporan...</p>
                </div>
            ) : data ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <DollarSign className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-4">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-emerald-100 font-medium mb-1">Total Pendapatan</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(data.totalPendapatan)}</h3>
                                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-100 bg-emerald-600/30 w-fit px-3 py-1 rounded-full">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Periode terpilih</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShoppingBag className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-4">
                                    <ShoppingBag className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-blue-100 font-medium mb-1">Total Transaksi Sukses</p>
                                <h3 className="text-3xl font-bold">
                                    {data.totalPesanan} <span className="text-lg font-normal opacity-80">Pesanan</span>
                                </h3>
                                <div className="mt-4 flex items-center gap-2 text-sm text-blue-100 bg-blue-600/30 w-fit px-3 py-1 rounded-full">
                                    <FileText className="w-4 h-4" />
                                    <span>Data terverifikasi</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Grafik Pendapatan Harian</h3>
                                <p className="text-sm text-slate-500">Visualisasi pendapatan per hari dalam periode ini</p>
                            </div>
                        </div>

                        <div className="h-80 flex items-end gap-3 pb-2 border-b border-slate-100">
                            {data.chartData.length > 0 ? (
                                data.chartData.map((item, index) => {
                                    const maxVal = Math.max(...data.chartData.map((d) => d.total));
                                    const heightPercent = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
                                    return (
                                        <div
                                            key={index}
                                            className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                            <div className="relative w-full flex justify-center h-full items-end">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${heightPercent}%` }}
                                                    transition={{ duration: 1, delay: index * 0.05, ease: "easeOut" }}
                                                    className="w-full max-w-[40px] bg-gradient-to-t from-indigo-500 to-indigo-400 hover:from-amber-500 hover:to-amber-400 transition-all rounded-t-md relative shadow-sm group-hover:shadow-md">
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-20 shadow-xl font-medium">
                                                        {formatCurrency(item.total)}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 rotate-45 origin-left truncate w-full mt-2 font-medium">
                                                {new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                                    Tidak ada data transaksi pada periode ini.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Rincian Transaksi</h3>
                                <p className="text-sm text-slate-500">Daftar pesanan yang masuk dalam laporan ini</p>
                            </div>
                            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">Kode Pesanan</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Total Pembayaran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.orders.length > 0 ? (
                                        data.orders.map((order: any, idx) => (
                                            <motion.tr
                                                key={order.kodePesanan}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    {new Date(order.tanggalPesan).toLocaleDateString("id-ID", {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-xs font-bold">
                                                        #{order.kodePesanan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                        Selesai
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-900 font-bold">
                                                    {formatCurrency(Number(order.totalBayar))}
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-12 text-center text-slate-500">
                                                Tidak ada transaksi ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            ) : null}
        </div>
    );
}
