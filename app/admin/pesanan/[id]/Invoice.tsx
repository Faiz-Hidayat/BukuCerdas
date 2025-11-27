import React from "react";

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
        };
    }[];
}

export default function Invoice({ order }: { order: OrderDetail }) {
    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    return (
        <div className="hidden print:block p-8 bg-white text-black max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
                    <p className="text-slate-600 mt-1">#{order.kodePesanan}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-900">BukuCerdas</h2>
                    <p className="text-sm text-slate-600">Jl. Pendidikan No. 123</p>
                    <p className="text-sm text-slate-600">Jakarta, Indonesia</p>
                    <p className="text-sm text-slate-600">support@bukucerdas.com</p>
                </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Ditagihkan Kepada:</h3>
                    <p className="font-bold text-slate-900">{order.user.namaLengkap}</p>
                    <p className="text-slate-600">{order.alamatUser.alamatLengkap}</p>
                    <p className="text-slate-600">
                        {order.alamatUser.kota}, {order.alamatUser.provinsi} {order.alamatUser.kodePos}
                    </p>
                    <p className="text-slate-600">{order.user.email}</p>
                </div>
                <div className="text-right">
                    <div className="space-y-2">
                        <div>
                            <span className="text-slate-500 text-sm">Tanggal Pesanan:</span>
                            <span className="ml-4 font-medium text-slate-900">
                                {new Date(order.tanggalPesan).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-sm">Metode Pembayaran:</span>
                            <span className="ml-4 font-medium text-slate-900 uppercase">
                                {order.metodePembayaran.replace("_", " ")}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-sm">Status Pembayaran:</span>
                            <span className="ml-4 font-medium text-slate-900 uppercase">
                                {order.statusPembayaran.replace("_", " ")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="text-left py-3 font-bold text-slate-700">Deskripsi</th>
                        <th className="text-center py-3 font-bold text-slate-700">Jumlah</th>
                        <th className="text-right py-3 font-bold text-slate-700">Harga Satuan</th>
                        <th className="text-right py-3 font-bold text-slate-700">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {order.detailPesanan.map((item) => (
                        <tr key={item.idDetail}>
                            <td className="py-4 text-slate-800">{item.buku.judul}</td>
                            <td className="py-4 text-center text-slate-600">{item.jumlah}</td>
                            <td className="py-4 text-right text-slate-600">{formatCurrency(item.hargaSatuan)}</td>
                            <td className="py-4 text-right font-medium text-slate-900">{formatCurrency(item.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-12">
                <div className="w-1/2 space-y-3">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>Ongkos Kirim</span>
                        <span>{formatCurrency(order.ongkir)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>Pajak</span>
                        <span>{formatCurrency(order.pajakNominal)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-4 border-t-2 border-slate-800">
                        <span>Total Bayar</span>
                        <span>{formatCurrency(order.totalBayar)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-slate-500 text-sm pt-8 border-t border-slate-100">
                <p>Terima kasih telah berbelanja di BukuCerdas.</p>
                <p>Silakan hubungi kami jika ada pertanyaan mengenai invoice ini.</p>
            </div>
        </div>
    );
}
