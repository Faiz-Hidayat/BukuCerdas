import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'BukuCerdas | Tentang Kami',
  description: 'Mengenal BukuCerdas, toko buku online pilihan keluarga dan pelajar Indonesia.',
};

export default function TentangKamiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
