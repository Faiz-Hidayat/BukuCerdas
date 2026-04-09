import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'BukuCerdas | Katalog Buku',
  description: 'Jelajahi dan cari buku terbaru di BukuCerdas.',
};

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
