import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'BukuCerdas | Checkout',
  description: 'Proses pembayaran pesanan Anda.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
