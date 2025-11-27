"use client";

import React, { useState, useEffect } from "react";
import { Calendar, DollarSign, ShoppingBag, Printer, TrendingUp, FileText, Download, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface ReportData {
    totalPendapatan: number;
    totalPengeluaran: number;
    totalPesanan: number;
    chartData: { date: string; income: number; expense: number }[];
    transactions: {
        id: string;
        date: string;
        type: 'pemasukan' | 'pengeluaran';
        description: string;
        amount: number;
        refCode: string;
    }[];
}

export default function LaporanPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportType, setReportType] = useState("daily");
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
    }, [startDate, endDate, reportType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/laporan?startDate=${startDate}&endDate=${endDate}&type=${reportType}`);
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
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 20mm;
                        size: auto;
                    }
                    body {
                        background: white;
                    }
                    aside, nav, header, .no-print {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .print-hidden {
                        display: none !important;
                    }
                    .print-full-width {
                        width: 100% !important;
                        max-width: none !important;
                        flex: none !important;
                    }
                    .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                }
            `}</style>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-8 border-b-2 border-slate-800 pb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2 bg-slate-900 text-white rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">BUKU CERDAS</h1>
                </div>
                <p className="text-slate-600 font-medium">Laporan Keuangan & Transaksi</p>
                <p className="text-sm text-slate-500 mt-1">
                    Periode: {new Date(startDate).toLocaleDateString("id-ID", { dateStyle: "long" })} - {new Date(endDate).toLocaleDateString("id-ID", { dateStyle: "long" })}
                </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print-hidden">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-indigo-600">
                        Laporan Keuangan
                    </h2>
                    <p className="text-slate-500 mt-1">Ringkasan pemasukan dan pengeluaran toko.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all shadow-sm hover:shadow-md font-medium">
                    <Printer className="w-4 h-4" />
                    Cetak Laporan
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 flex flex-wrap items-center gap-4 print-hidden">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <span>Periode:</span>
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
                
                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span>Jenis:</span>
                </div>
                <select 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                    <option value="daily">Harian</option>
                    <option value="monthly">Bulanan</option>
                </select>

                <button
                    onClick={fetchReport}
                    className="ml-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ArrowUpRight className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-4">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-emerald-100 font-medium mb-1">Total Pemasukan</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(data.totalPendapatan)}</h3>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ArrowDownRight className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-4">
                                    <TrendingDown className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-rose-100 font-medium mb-1">Total Pengeluaran</p>
                                <h3 className="text-3xl font-bold">{formatCurrency(data.totalPengeluaran)}</h3>
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
                                <p className="text-blue-100 font-medium mb-1">Total Transaksi</p>
                                <h3 className="text-3xl font-bold">
                                    {data.totalPesanan} <span className="text-lg font-normal opacity-80">Pesanan</span>
                                </h3>
                            </div>
                        </motion.div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Grafik Perbandingan</h3>
                                <p className="text-sm text-slate-500">Pemasukan vs Pengeluaran per {reportType === 'daily' ? 'hari' : 'bulan'}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span>Pemasukan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                    <span>Pengeluaran</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-80 flex items-end gap-3 pb-2 border-b border-slate-100 overflow-x-auto">
                            {data.chartData.length > 0 ? (
                                data.chartData.map((item, index) => {
                                    const maxVal = Math.max(...data.chartData.map((d) => Math.max(d.income, d.expense)));
                                    const incomeHeight = maxVal > 0 ? (item.income / maxVal) * 100 : 0;
                                    const expenseHeight = maxVal > 0 ? (item.expense / maxVal) * 100 : 0;
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="flex-1 min-w-[60px] flex flex-col items-center gap-2 group h-full justify-end">
                                            <div className="relative w-full flex justify-center h-full items-end gap-1">
                                                {/* Income Bar */}
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${incomeHeight}%` }}
                                                    transition={{ duration: 1, delay: index * 0.05 }}
                                                    className="w-full max-w-[20px] bg-emerald-500 rounded-t-sm relative group/bar">
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/bar:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                                        {formatCurrency(item.income)}
                                                    </div>
                                                </motion.div>
                                                
                                                {/* Expense Bar */}
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${expenseHeight}%` }}
                                                    transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
                                                    className="w-full max-w-[20px] bg-rose-500 rounded-t-sm relative group/bar">
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/bar:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                                        {formatCurrency(item.expense)}
                                                    </div>
                                                </motion.div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 rotate-45 origin-left truncate w-full mt-2 font-medium">
                                                {reportType === 'daily' 
                                                    ? new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                                                    : item.date
                                                }
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
                                <h3 className="font-bold text-slate-800 text-lg">Riwayat Transaksi</h3>
                                <p className="text-sm text-slate-500">Daftar lengkap pemasukan dan pengeluaran</p>
                            </div>
                            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 print-hidden">
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">Jenis</th>
                                        <th className="px-6 py-4">Keterangan</th>
                                        <th className="px-6 py-4">Kode Ref</th>
                                        <th className="px-6 py-4 text-right">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.transactions.length > 0 ? (
                                        data.transactions.map((trx, idx) => (
                                            <motion.tr
                                                key={trx.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    {new Date(trx.date).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        trx.type === 'pemasukan' 
                                                            ? 'bg-emerald-100 text-emerald-800' 
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {trx.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-700">
                                                    {trx.description}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                    {trx.refCode}
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold ${
                                                    trx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                    {trx.type === 'pemasukan' ? '+' : '-'}{formatCurrency(trx.amount)}
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
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
