import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'BukuCerdas | Daftar Akun',
  description: 'Daftar dan buat akun BukuCerdas sekarang juga.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
