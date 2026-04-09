'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  ShoppingBag,
  Printer,
  TrendingUp,
  FileText,
  Download,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // Set default dates (this month)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
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
      console.error('Failed to fetch report', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      <style jsx global>{`
        @media print {
          @page {
            margin: 15mm;
            size: auto;
          }
          html, body {
            background: white;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          aside,
          nav,
          header,
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            display: block !important;
          }
          /* Matikan efek framer-motion saat cetak agar tidak memotong isi halaman (Chrome Bug) */
          .print-safe-motion {
            transform: none !important;
            opacity: 1 !important;
            animation: none !important;
          }
          .avoid-page-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .print-hidden {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: none !important;
            flex: none !important;
          }
          .shadow-xl,
          .shadow-lg,
          .shadow-md,
          .shadow-sm {
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
          Periode: {new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} -{' '}
          {new Date(endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
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
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
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
          className="space-y-8 print-safe-motion">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 md:gap-6 print-safe-motion">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden print-safe-motion">
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
              className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden print-safe-motion">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ArrowDownRight className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-4 print:-ml-1">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <p className="text-rose-100 font-medium mb-1">Total Pengeluaran</p>
                <h3 className="text-3xl font-bold">{formatCurrency(data.totalPengeluaran)}</h3>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden print-safe-motion">
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
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-0 print:p-0 print:mb-8 print:block print:overflow-visible print:w-full print:h-auto avoid-page-break">
            <div className="mb-6 print:mb-4">
              <h3 className="text-lg font-bold text-slate-800">Grafik Perbandingan</h3>
              <p className="text-sm text-slate-500">
                Pemasukan vs Pengeluaran per {reportType === 'daily' ? 'hari' : 'bulan'}
              </p>
            </div>

            <div className="h-[400px] w-full print:block print:h-auto print:min-h-min print:w-full print:overflow-visible">
              {data.chartData.length > 0 ? (
                <div className="print:hidden h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.chartData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                      barGap={4}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tickMargin={15}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => {
                           if (reportType === 'daily') {
                             return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                           }
                           return value;
                        }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(value) => 
                          new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(value)
                        }
                        tickMargin={15}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => {
                           if (reportType === 'daily') {
                             return new Date(label).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                           }
                           return label;
                        }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Legend 
                         iconType="circle" 
                         wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} 
                         formatter={(value) => value === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      />
                      <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
                      <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 print:hidden">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                  Tidak ada data transaksi pada periode ini.
                </div>
              )}
              
              {/* Versi cetak data chart statis (Tabel perbandingan) karena SVG ResponsiveContainer sering error pemecahan halaman */}
              <div className="hidden print:block w-full">
                <table className="w-full text-sm border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 px-4 py-2 text-left">Periode ({reportType === 'daily' ? 'Tanggal' : 'Bulan'})</th>
                      <th className="border border-slate-200 px-4 py-2 text-right text-emerald-700">Pemasukan</th>
                      <th className="border border-slate-200 px-4 py-2 text-right text-rose-700">Pengeluaran</th>
                      <th className="border border-slate-200 px-4 py-2 text-right font-bold">Laba Bersih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.chartData.length > 0 ? (
                      data.chartData.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border border-slate-200 px-4 py-2 font-medium">
                            {reportType === 'daily' ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : item.date}
                          </td>
                          <td className="border border-slate-200 px-4 py-2 text-right text-emerald-600">{formatCurrency(item.income)}</td>
                          <td className="border border-slate-200 px-4 py-2 text-right text-rose-600">{formatCurrency(item.expense)}</td>
                          <td className={`border border-slate-200 px-4 py-2 text-right font-bold ${item.income - item.expense >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {formatCurrency(item.income - item.expense)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="border border-slate-200 px-4 py-4 text-center text-slate-500">Tidak ada data.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-slate-200 overflow-hidden print:overflow-visible min-h-min h-auto print:block">
            <div className="mb-6 print:mb-4 flex justify-between items-center print:bg-white text-left">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Riwayat Transaksi</h3>
                <p className="text-sm text-slate-500">Daftar lengkap pemasukan dan pengeluaran</p>
              </div>
              <button
                onClick={() => {
                  if (!data) return;
                  const header = 'Tanggal,Jenis,Keterangan,Kode Ref,Nominal\n';
                  const rows = data.transactions
                    .map((trx) => {
                      const date = new Date(trx.date).toLocaleDateString('id-ID');
                      const jenis = trx.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
                      const desc = trx.description.replace(/,/g, ' ');
                      const sign = trx.type === 'pemasukan' ? '' : '-';
                      return `${date},${jenis},${desc},${trx.refCode},${sign}${trx.amount}`;
                    })
                    .join('\n');
                  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `laporan-${startDate}-${endDate}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 print-hidden">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto print:overflow-visible print:w-full">
              <table className="w-full text-sm text-left print:text-xs">
                <thead className="bg-slate-50/80 print:bg-slate-100 text-slate-500 print:text-slate-800 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 print:py-2">Tanggal</th>
                    <th className="px-6 py-4 print:py-2">Jenis</th>
                    <th className="px-6 py-4 print:py-2">Keterangan</th>
                    <th className="px-6 py-4 print:py-2">Kode Ref</th>
                    <th className="px-6 py-4 print:py-2 text-right">Nominal</th>
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
                        className="hover:bg-slate-50 transition-colors print:table-row print-safe-motion">
                        <td className="px-6 py-4 print:py-2 text-slate-600 font-medium">
                          {new Date(trx.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 print:py-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trx.type === 'pemasukan' ? 'bg-emerald-100 text-emerald-800 print:text-emerald-600' : 'bg-rose-100 text-rose-800 print:text-rose-600'
                            }`}>
                            {trx.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </td>
                        <td className="px-6 py-4 print:py-2 text-slate-700">{trx.description}</td>
                        <td className="px-6 py-4 print:py-2 font-mono text-xs text-slate-500">{trx.refCode}</td>
                        <td
                          className={`px-6 py-4 print:py-2 text-right font-bold ${
                            trx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                          {trx.type === 'pemasukan' ? '+' : '-'}
                          {formatCurrency(trx.amount)}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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
