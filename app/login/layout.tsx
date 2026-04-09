import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'BukuCerdas | Masuk',
  description: 'Masuk ke akun BukuCerdas Anda.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
