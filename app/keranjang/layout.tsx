import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'BukuCerdas | Keranjang Saya',
  description: 'Kelola buku yang akan Anda beli.',
};

export default function KeranjangLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
