import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BukuCerdas - Toko Buku Online Terpercaya",
  description: "Temukan koleksi buku terlengkap dengan harga terjangkau. Pengiriman cepat ke seluruh Indonesia.",
  keywords: ["toko buku", "buku online", "jual buku", "beli buku", "buku murah"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${libreBaskerville.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
