"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, CheckCircle, XCircle, Truck, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface OrderDetail {
    idPesanan: number;
    kodePesanan: string;
    tanggalPesan: string;
    statusPembayaran: string;
    statusPesanan: string;
    metodePembayaran: string;
    subtotal: string;
    ongkir: string;
    pajakNominal: string;
    totalBayar: string;
    buktiPembayaranUrl: string | null;
    user: {
        namaLengkap: string;
        email: string;
        nomorTelepon: string;
    };
    alamatUser: {
        namaPenerima: string;
        nomorTelepon: string;
        alamatLengkap: string;
        kota: string;
        provinsi: string;
        kodePos: string;
    };
    detailPesanan: {
        idDetail: number;
        jumlah: number;
        hargaSatuan: string;
        subtotal: string;
        buku: {
            judul: string;
            coverUrl: string | null;
        };
    }[];
}

export default function DetailPesananPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchOrder(params.id as string);
        }
    }, [params.id]);

    const fetchOrder = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/pesanan/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            }
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (field: "statusPembayaran" | "statusPesanan", value: string) => {
        if (!order) return;
        if (!confirm(`Ubah status menjadi ${value}?`)) return;

        try {
            const res = await fetch(`/api/admin/pesanan/${order.idPesanan}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: value }),
            });

            if (res.ok) {
                fetchOrder(order.idPesanan.toString());
            } else {
                alert("Gagal mengupdate status");
            }
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!order) return <div className="p-8 text-center">Pesanan tidak ditemukan</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/pesanan"
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Detail Pesanan #{order.kodePesanan}</h2>
                        <p className="text-slate-500">
                            {new Date(order.tanggalPesan).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                    <Printer className="w-4 h-4" />
                    Cetak Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-800">Item Pesanan</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.detailPesanan.map((item) => (
                                <div
                                    key={item.idDetail}
                                    className="p-4 flex gap-4">
                                    <div className="w-16 h-24 bg-slate-100 rounded overflow-hidden relative shrink-0">
                                        {item.buku.coverUrl ? (
                                            <Image
                                                src={item.buku.coverUrl}
                                                alt={item.buku.judul}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Cover</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-900">{item.buku.judul}</h4>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {item.jumlah} x {formatCurrency(item.hargaSatuan)}
                                        </p>
                                    </div>
                                    <div className="text-right font-medium text-slate-900">{formatCurrency(item.subtotal)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Ongkos Kirim</span>
                                <span>{formatCurrency(order.ongkir)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Pajak</span>
                                <span>{formatCurrency(order.pajakNominal)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total Bayar</span>
                                <span>{formatCurrency(order.totalBayar)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Proof */}
                    {order.buktiPembayaranUrl && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-semibold text-slate-800">Bukti Pembayaran</h3>
                            </div>
                            <div className="p-4">
                                <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
                                    <Image
                                        src={order.buktiPembayaranUrl}
                                        alt="Bukti Pembayaran"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => updateStatus("statusPembayaran", "terkonfirmasi")}
                                        disabled={order.statusPembayaran === "terkonfirmasi"}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <CheckCircle className="w-4 h-4" />
                                        Konfirmasi Pembayaran
                                    </button>
                                    <button
                                        onClick={() => updateStatus("statusPembayaran", "dibatalkan")}
                                        disabled={order.statusPembayaran === "dibatalkan"}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <XCircle className="w-4 h-4" />
                                        Tolak / Batalkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Status Pesanan</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Pembayaran</label>
                                <div
                                    className={`mt-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                                        order.statusPembayaran === "terkonfirmasi"
                                            ? "bg-green-50 border-green-200 text-green-700"
                                            : order.statusPembayaran === "dibatalkan"
                                            ? "bg-red-50 border-red-200 text-red-700"
                                            : "bg-yellow-50 border-yellow-200 text-yellow-700"
                                    }`}>
                                    {order.statusPembayaran.replace("_", " ").toUpperCase()}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Pengiriman</label>
                                <select
                                    value={order.statusPesanan}
                                    onChange={(e) => updateStatus("statusPesanan", e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                                    <option value="diproses">Diproses</option>
                                    <option value="dikirim">Dikirim</option>
                                    <option value="selesai">Selesai</option>
                                    <option value="dibatalkan">Dibatalkan</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Informasi Pelanggan</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-slate-500">Nama</p>
                                <p className="font-medium text-slate-900">{order.user.namaLengkap}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Email</p>
                                <p className="font-medium text-slate-900">{order.user.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Telepon</p>
                                <p className="font-medium text-slate-900">{order.user.nomorTelepon || "-"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Alamat Pengiriman</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-slate-500">Penerima</p>
                                <p className="font-medium text-slate-900">{order.alamatUser.namaPenerima}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Telepon</p>
                                <p className="font-medium text-slate-900">{order.alamatUser.nomorTelepon}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Alamat</p>
                                <p className="text-slate-900">{order.alamatUser.alamatLengkap}</p>
                                <p className="text-slate-900">
                                    {order.alamatUser.kota}, {order.alamatUser.provinsi} {order.alamatUser.kodePos}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
