import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'BukuCerdas | Pesanan Saya',
  description: 'Lihat riwayat pesanan buku Anda.',
};

export default function PesananSayaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
