# 📚 BukuCerdas - Platform Toko Buku Online Modern & Terintegrasi

![BukuCerdas Banner](https://via.placeholder.com/1200x400?text=BukuCerdas+Official+Banner)

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)
[![Status](https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge)]()

**BukuCerdas** adalah solusi e-commerce komprehensif yang dirancang khusus untuk toko buku modern. Dibangun dengan arsitektur *full-stack* menggunakan teknologi web terkini, BukuCerdas menghadirkan pengalaman belanja yang cepat, responsif, dan aman bagi pelanggan, serta dashboard manajemen yang powerful bagi administrator.

Proyek ini mengimplementasikan praktik terbaik dalam pengembangan web modern, termasuk Server-Side Rendering (SSR), Static Site Generation (SSG), optimasi gambar otomatis, keamanan tingkat lanjut, dan desain antarmuka yang intuitif.

---

## 📋 Daftar Isi

1.  [Tentang Proyek](#-tentang-proyek)
    *   [Latar Belakang](#latar-belakang)
    *   [Visi & Misi](#visi--misi)
2.  [Fitur Utama](#-fitur-utama)
    *   [Modul Pelanggan (User)](#modul-pelanggan-user)
    *   [Modul Administrator (Admin)](#modul-administrator-admin)
3.  [Arsitektur & Teknologi](#-arsitektur--teknologi)
    *   [Frontend Stack](#frontend-stack)
    *   [Backend Stack](#backend-stack)
    *   [Database & Storage](#database--storage)
4.  [Struktur Direktori](#-struktur-direktori)
5.  [Dokumentasi Database](#-dokumentasi-database)
    *   [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
    *   [Detail Tabel](#detail-tabel)
6.  [Prasyarat Sistem](#-prasyarat-sistem)
7.  [Panduan Instalasi (End-to-End)](#-panduan-instalasi-end-to-end)
    *   [Persiapan Lingkungan](#1-persiapan-lingkungan)
    *   [Instalasi Aplikasi](#2-instalasi-aplikasi)
    *   [Konfigurasi Database](#3-konfigurasi-database)
    *   [Seeding Data](#4-seeding-data)
8.  [Menjalankan Aplikasi](#-menjalankan-aplikasi)
9.  [Panduan Penggunaan](#-panduan-penggunaan)
    *   [Alur Belanja User](#alur-belanja-user)
    *   [Manajemen Toko Admin](#manajemen-toko-admin)
10. [API Documentation](#-api-documentation)
11. [Deployment](#-deployment)
12. [Troubleshooting & FAQ](#-troubleshooting--faq)
13. [Kontribusi](#-kontribusi)
14. [Lisensi](#-lisensi)
15. [Kontak](#-kontak)

---

## 📖 Tentang Proyek

### Latar Belakang
Di era digital saat ini, toko buku fisik menghadapi tantangan besar dalam menjangkau pembaca yang semakin terbiasa dengan kenyamanan belanja online. **BukuCerdas** hadir untuk menjembatani kesenjangan ini dengan menyediakan platform digital yang tidak hanya sekadar toko online, tetapi juga ekosistem literasi yang menarik.

### Visi & Misi
**Visi:** Menjadi platform toko buku digital nomor satu di Indonesia yang mengutamakan pengalaman pengguna dan kemudahan akses literasi.

**Misi:**
1.  Menyediakan platform jual beli buku yang aman, cepat, dan mudah digunakan.
2.  Mendukung toko buku lokal untuk beralih ke ranah digital (Go Digital).
3.  Membangun komunitas pembaca melalui fitur ulasan dan rekomendasi buku.

---

## 🌟 Fitur Utama

### Modul Pelanggan (User)

Fitur-fitur ini dirancang untuk memberikan kenyamanan maksimal bagi pembeli:

*   **Landing Page Menarik:** Halaman depan yang menampilkan buku terlaris, terbaru, dan rekomendasi dengan animasi yang halus.
*   **Pencarian & Filter Canggih:** Cari buku berdasarkan judul, penulis, ISBN, atau filter berdasarkan kategori dan rentang harga.
*   **Detail Buku Komprehensif:** Informasi lengkap mencakup sinopsis, spesifikasi fisik, stok real-time, dan ulasan pembeli lain.
*   **Keranjang Belanja Dinamis:** Tambah/kurang item, hitung subtotal otomatis, dan simpan item untuk nanti.
*   **Sistem Checkout Aman:**
    *   Pilihan alamat pengiriman (bisa simpan banyak alamat).
    *   Kalkulasi ongkos kirim otomatis berdasarkan wilayah.
    *   Ringkasan pesanan sebelum pembayaran.
*   **Beragam Metode Pembayaran:**
    *   Transfer Bank (Manual konfirmasi).
    *   E-Wallet (OVO, GoPay, Dana).
    *   QRIS (Scan & Upload).
    *   COD (Cash on Delivery) untuk wilayah tertentu.
*   **Manajemen Akun:**
    *   Profil pengguna & upload foto.
    *   Riwayat pesanan lengkap dengan status tracking.
    *   Ganti password & pengaturan keamanan.
*   **Ulasan & Rating:** Berikan bintang dan komentar pada buku yang sudah dibeli (Verified Purchase).

### Modul Administrator (Admin)

Dashboard khusus untuk pemilik toko mengelola bisnis:

*   **Dashboard Eksekutif:**
    *   Grafik penjualan bulanan/tahunan.
    *   Statistik pesanan (Baru, Proses, Selesai).
    *   Notifikasi stok menipis.
    *   Ringkasan pendapatan bersih.
*   **Manajemen Inventaris (Buku):**
    *   CRUD (Create, Read, Update, Delete) data buku.
    *   Upload cover buku dengan preview.
    *   Manajemen stok dan penyesuaian harga.
    *   Pengaturan status aktif/nonaktif produk.
*   **Manajemen Kategori:** Tambah dan atur kategori buku untuk navigasi yang lebih baik.
*   **Manajemen Pesanan (Order Fulfillment):**
    *   Lihat daftar pesanan masuk.
    *   Verifikasi bukti pembayaran manual.
    *   Update status pesanan (Konfirmasi -> Proses -> Kirim -> Selesai).
    *   Cetak Invoice/Nota pesanan.
    *   Input nomor resi pengiriman.
*   **Manajemen Pengguna:** Pantau daftar pelanggan terdaftar dan blokir akun mencurigakan.
*   **Laporan Keuangan:**
    *   Laporan pemasukan harian/bulanan.
    *   Rekapitulasi metode pembayaran terpopuler.
*   **Pengaturan Toko:**
    *   Konfigurasi nama toko, alamat, dan kontak.
    *   Pengaturan rekening bank & metode pembayaran aktif.
    *   Manajemen tarif ongkos kirim per wilayah.

---

## 🏗 Arsitektur & Teknologi

Proyek ini dibangun di atas stack teknologi modern yang menjamin performa, skalabilitas, dan kemudahan maintenance.

### Frontend Stack
*   **Next.js 15 (App Router):** Framework React utama yang menangani routing, rendering (SSR/SSG), dan API routes.
*   **React 19:** Library UI untuk membangun komponen interaktif.
*   **TypeScript:** Superset JavaScript yang menambahkan static typing untuk mencegah bug saat development.
*   **Tailwind CSS:** Framework CSS utility-first untuk styling cepat dan responsif.
*   **Framer Motion:** Library animasi untuk transisi halaman dan interaksi mikro yang halus.
*   **Lucide React:** Koleksi ikon SVG yang ringan dan konsisten.
*   **Recharts:** Library charting untuk visualisasi data di dashboard admin.
*   **Zod:** Schema validation untuk form dan API input.

### Backend Stack
*   **Node.js:** Runtime environment untuk menjalankan JavaScript di server.
*   **Next.js API Routes:** Serverless functions yang menangani logika backend (REST API).
*   **Prisma ORM:** Object-Relational Mapper modern untuk interaksi database yang type-safe.
*   **Jose (JWT):** Library untuk pembuatan dan verifikasi JSON Web Tokens (stateless authentication).
*   **Bcrypt.js:** Library hashing password untuk keamanan data pengguna.

### Database & Storage
*   **MySQL:** Database relasional utama untuk menyimpan data user, produk, dan transaksi.
*   **Local Storage / Public Folder:** Penyimpanan file statis (gambar cover, bukti transfer) di server lokal (dapat dikonfigurasi ke Cloud Storage seperti AWS S3/Supabase Storage).

---

## 📂 Struktur Direktori

Berikut adalah penjelasan mendalam mengenai struktur folder proyek `BukuCerdas`:

```plaintext
BukuCerdas/
├── app/                            # Core Application Logic (Next.js App Router)
│   ├── (marketing)/                # Route Group: Halaman Publik (Landing, About)
│   │   ├── _components/            # Komponen spesifik marketing (Hero, Features)
│   │   ├── page.tsx                # Homepage (/)
│   │   └── tentang-kami/           # Halaman About Us
│   ├── admin/                      # Route Group: Halaman Admin (Protected)
│   │   ├── _components/            # Komponen admin (Sidebar, Charts)
│   │   ├── dashboard/              # Dashboard utama admin
│   │   ├── buku/                   # Manajemen buku
│   │   ├── pesanan/                # Manajemen pesanan
│   │   └── ...                     # Halaman admin lainnya
│   ├── api/                        # Backend API Endpoints
│   │   ├── admin/                  # API khusus admin
│   │   ├── auth/                   # API autentikasi (login, register)
│   │   ├── buku/                   # API publik data buku
│   │   └── ...                     # API lainnya
│   ├── (user)/                     # Route Group: Halaman User (Protected/Public)
│   │   ├── katalog/                # Halaman pencarian buku
│   │   ├── keranjang/              # Halaman keranjang belanja
│   │   ├── checkout/               # Halaman checkout
│   │   ├── profil/                 # Halaman profil user
│   │   └── pesanan-saya/           # Halaman riwayat pesanan
│   ├── login/                      # Halaman Login
│   ├── register/                   # Halaman Register
│   ├── globals.css                 # Global CSS & Tailwind directives
│   └── layout.tsx                  # Root Layout (HTML, Body, Fonts)
├── components/                     # Komponen UI Global (Button, Input, Modal)
│   └── ui/                         # Komponen atomik (biasanya dari Shadcn/UI)
├── lib/                            # Utility & Helper Functions
│   ├── auth.ts                     # Logika verifikasi token & session
│   ├── prisma.ts                   # Singleton instance Prisma Client
│   ├── utils.ts                    # Helper umum (format currency, date)
│   └── upload.ts                   # Helper untuk handle file upload
├── prisma/                         # Konfigurasi Database
│   ├── schema.prisma               # Definisi skema database
│   ├── seed.ts                     # Script seeding data awal
│   └── migrations/                 # History perubahan skema database
├── public/                         # Static Assets (dapat diakses publik)
│   ├── images/                     # Gambar statis website
│   └── uploads/                    # Folder upload user (cover buku, bukti bayar)
├── middleware.ts                   # Middleware Next.js (Auth protection)
├── next.config.mjs                 # Konfigurasi Next.js
├── tailwind.config.ts              # Konfigurasi Tailwind CSS
├── tsconfig.json                   # Konfigurasi TypeScript
└── package.json                    # Daftar dependencies & scripts
```

---

## 🗄️ Dokumentasi Database

Database `BukuCerdas` dirancang dengan normalisasi yang baik untuk menjaga integritas data. Berikut adalah skema tabel utamanya.

### Entity Relationship Diagram (ERD)
*Secara konseptual:*
*   `User` (1) ---- (N) `Pesanan`
*   `User` (1) ---- (N) `AlamatUser`
*   `User` (1) ---- (1) `Keranjang`
*   `KategoriBuku` (1) ---- (N) `Buku`
*   `Buku` (1) ---- (N) `DetailPesanan`
*   `Pesanan` (1) ---- (N) `DetailPesanan`

### Detail Tabel

#### 1. Tabel `User` (`user`)
Menyimpan data akun pengguna.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id_user` | INT (PK) | ID Unik Auto Increment |
| `nama_lengkap` | VARCHAR | Nama lengkap user |
| `email` | VARCHAR | Email unik (login) |
| `kata_sandi_hash` | VARCHAR | Password terenkripsi |
| `role` | ENUM | `admin` atau `user` |
| `status_akun` | ENUM | `aktif`, `nonaktif`, `suspended` |

#### 2. Tabel `Buku` (`buku`)
Menyimpan katalog produk buku.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id_buku` | INT (PK) | ID Unik Buku |
| `judul` | VARCHAR | Judul Buku |
| `harga` | DECIMAL | Harga satuan |
| `stok` | INT | Jumlah stok tersedia |
| `cover_url` | VARCHAR | Path gambar cover |
| `id_kategori` | INT (FK) | Relasi ke tabel Kategori |

#### 3. Tabel `Pesanan` (`pesanan`)
Menyimpan header transaksi.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id_pesanan` | INT (PK) | ID Transaksi |
| `kode_pesanan` | VARCHAR | Kode unik (misal: INV/2023/XI/001) |
| `id_user` | INT (FK) | Pembeli |
| `total_bayar` | DECIMAL | Total nominal transaksi |
| `status_pesanan` | ENUM | Status flow pesanan |
| `status_pembayaran`| ENUM | Status pembayaran |

*(Lihat file `prisma/schema.prisma` untuk detail lengkap seluruh tabel)*

---

## 💻 Prasyarat Sistem

Sebelum memulai instalasi, pastikan perangkat Anda memenuhi spesifikasi berikut:

1.  **Sistem Operasi:** Windows 10/11, macOS, atau Linux (Ubuntu/Debian).
2.  **Node.js:** Versi LTS (v18.x atau v20.x). Cek dengan `node -v`.
3.  **Package Manager:** npm (bawaan Node.js), yarn, atau pnpm.
4.  **Database:** MySQL Server 8.0+.
    *   *Windows:* Disarankan menggunakan **Laragon** atau **XAMPP**.
    *   *Mac/Linux:* Install via Homebrew atau apt.
5.  **Git:** Untuk version control.
6.  **Code Editor:** Visual Studio Code (VS Code) dengan ekstensi:
    *   ESLint
    *   Prettier
    *   Prisma
    *   Tailwind CSS IntelliSense

---

## 🚀 Panduan Instalasi (End-to-End)

Ikuti langkah demi langkah ini untuk menjalankan BukuCerdas di komputer lokal Anda.

### 1. Persiapan Lingkungan

Pastikan MySQL service sudah berjalan.
*   Jika pakai **Laragon**: Klik tombol "Start All". Pastikan port 3306 aktif.
*   Buat database kosong baru bernama `bukucerdas_db` (Opsional, Prisma bisa membuatnya otomatis, tapi lebih aman buat manual).

### 2. Instalasi Aplikasi

Buka terminal/command prompt:

```bash
# 1. Clone repository
git clone https://github.com/Faiz-Hidayat/BukuCerdas.git

# 2. Masuk ke direktori project
cd BukuCerdas

# 3. Install dependencies (ini mungkin memakan waktu beberapa menit)
npm install
# atau
yarn install
```

### 3. Konfigurasi Database

Salin file contoh environment variables:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Mac/Linux/Bash
cp .env.example .env
```

Buka file `.env` di text editor dan sesuaikan isinya:

```env
# Konfigurasi Database MySQL
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL="mysql://root:@localhost:3306/bukucerdas_db"

# Kunci Rahasia untuk JWT (Gunakan string acak yang panjang)
JWT_SECRET="rahasia_dapur_buku_cerdas_jangan_disebar_12345"

# URL Aplikasi (Penting untuk redirect dan image optimization)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

> **Catatan untuk Pengguna Laragon:** Default user adalah `root` dan password kosong. Jadi `mysql://root:@localhost...` sudah benar.

### 4. Seeding Data

Kita perlu membuat struktur tabel dan mengisi data awal (Admin default, kategori, dll).

```bash
# 1. Generate Prisma Client (agar TypeScript mengenali skema database)
npx prisma generate

# 2. Jalankan Migrasi (Membuat tabel di database)
npx prisma migrate dev --name init_schema

# 3. Jalankan Seeding (Mengisi data dummy)
npx prisma db seed
```

Jika berhasil, Anda akan melihat pesan: `🌱 Seeding finished.`

---

## ▶️ Menjalankan Aplikasi

Sekarang aplikasi siap dijalankan dalam mode development.

```bash
npm run dev
```

Tunggu hingga muncul pesan `Ready in ... ms`.
Buka browser favorit Anda (Chrome/Edge/Firefox) dan akses:

**[http://localhost:3000](http://localhost:3000)**

---

## 📖 Panduan Penggunaan

### Alur Belanja User
1.  **Registrasi:** Klik "Daftar" di pojok kanan atas. Isi nama, email, dan password.
2.  **Login:** Masuk dengan akun yang baru dibuat.
3.  **Cari Buku:** Gunakan kolom pencarian di navbar atau masuk ke menu "Katalog".
4.  **Beli:** Klik tombol "Tambah ke Keranjang" pada buku yang diinginkan.
5.  **Checkout:** Buka ikon keranjang, periksa item, lalu klik "Checkout".
6.  **Pembayaran:** Isi alamat lengkap, pilih metode pembayaran (misal: Transfer Bank), lalu "Buat Pesanan".
7.  **Konfirmasi:** Transfer sesuai nominal, lalu upload foto bukti transfer di halaman "Pesanan Saya".

### Manajemen Toko Admin
1.  **Login Admin:** Gunakan akun default (Username: `admin`, Pass: `admin123`).
2.  **Dashboard:** Pantau ringkasan penjualan hari ini.
3.  **Validasi Pesanan:**
    *   Masuk menu "Pesanan".
    *   Filter status "Menunggu Konfirmasi".
    *   Lihat bukti bayar. Jika valid, klik "Terima Pembayaran".
    *   Status berubah jadi "Diproses".
4.  **Pengiriman:**
    *   Setelah barang dikemas, klik "Kirim Pesanan".
    *   Masukkan nomor resi (opsional).
5.  **Tambah Produk:**
    *   Masuk menu "Buku".
    *   Klik "Tambah Buku".
    *   Isi data dan upload cover.

---

## 🔌 API Documentation

BukuCerdas menyediakan RESTful API yang dapat diakses di `/api`. Berikut adalah beberapa endpoint penting:

### Authentication
| Method | Endpoint | Deskripsi | Body Request |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Masuk ke sistem | `{ email, password }` |
| `POST` | `/api/auth/register` | Daftar akun baru | `{ nama, email, password }` |
| `GET` | `/api/auth/me` | Cek session user | - |

### Products (Buku)
| Method | Endpoint | Deskripsi | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/buku` | Ambil daftar buku | `?page=1&limit=10&search=...` |
| `GET` | `/api/buku/[id]` | Detail buku | - |
| `POST` | `/api/admin/buku` | Tambah buku (Admin) | Form Data (Multipart) |

### Orders (Pesanan)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/checkout` | Buat pesanan baru |
| `GET` | `/api/user/pesanan` | Riwayat pesanan user |
| `GET` | `/api/admin/pesanan` | Semua pesanan (Admin) |

---

## ☁️ Deployment

### Deploy ke Vercel (Recommended)
Vercel adalah platform terbaik untuk Next.js.
1.  Push kode ke GitHub.
2.  Buka dashboard Vercel -> "Add New Project".
3.  Import repository GitHub Anda.
4.  Di bagian **Environment Variables**, masukkan:
    *   `DATABASE_URL`: URL database MySQL Anda (Harus di-host di cloud, misal: Railway, PlanetScale, Aiven). **Database lokal (localhost) tidak bisa diakses Vercel.**
    *   `JWT_SECRET`: String rahasia Anda.
5.  Klik **Deploy**.

### Deploy ke VPS (Ubuntu/Nginx)
1.  Setup server Ubuntu dengan Node.js, Nginx, dan MySQL.
2.  Clone repo di server.
3.  `npm install` dan `npm run build`.
4.  Gunakan **PM2** untuk process management: `pm2 start npm --name "bukucerdas" -- start`.
5.  Konfigurasi Nginx sebagai Reverse Proxy ke port 3000.

---

## ❓ Troubleshooting & FAQ

**Q: Saya mendapat error `PrismaClientInitializationError` saat menjalankan aplikasi.**
A: Pastikan service MySQL sudah berjalan dan URL database di `.env` sudah benar (username, password, port).

**Q: Gambar cover buku tidak muncul.**
A: Pastikan folder `public/uploads` ada. Jika deploy di Vercel, file upload lokal akan hilang saat redeploy karena sifat *ephemeral* file system Vercel. Untuk production, gunakan layanan object storage seperti AWS S3 atau Cloudinary.

**Q: Bagaimana cara mereset database?**
A: Jalankan `npx prisma migrate reset`. Perintah ini akan menghapus semua data dan melakukan seeding ulang.

**Q: Apakah aplikasi ini support mobile?**
A: Ya, antarmuka BukuCerdas sepenuhnya responsif (Mobile-First Design) menggunakan Tailwind CSS.

---

## 🤝 Kontribusi

Kami sangat terbuka terhadap kontribusi dari komunitas!

1.  **Fork** repository ini.
2.  Buat branch fitur baru (`git checkout -b fitur/NamaFitur`).
3.  Commit perubahan Anda (`git commit -m 'Menambahkan fitur X'`).
4.  Push ke branch (`git push origin fitur/NamaFitur`).
5.  Buat **Pull Request** di GitHub.

Harap ikuti *Code of Conduct* dan pastikan kode Anda lolos linting (`npm run lint`).

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan ulang proyek ini untuk tujuan pribadi maupun komersial. Lihat file [LICENSE](./LICENSE) untuk detail lengkap.

---

## 📞 Kontak

Jika Anda memiliki pertanyaan, saran, atau ingin melaporkan bug, silakan hubungi kami:

*   **Email:** developer@bukucerdas.id
*   **Website:** [www.bukucerdas.id](https://www.bukucerdas.id)
*   **GitHub:** [Faiz-Hidayat](https://github.com/Faiz-Hidayat)

---
*Dibuat dengan ❤️ dan ☕ oleh Tim Pengembang BukuCerdas.*
