# Gap Analysis — BukuCerdas vs PRD & Development Plan

**Tanggal Analisis:** 6 April 2026  
**Status:** Analisis mendalam terhadap seluruh codebase, API, UI, schema, dan business logic

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Perbedaan Arsitektur vs PRD](#2-perbedaan-arsitektur-vs-prd)
3. [Gap Prisma Schema vs PRD Data Model](#3-gap-prisma-schema-vs-prd-data-model)
4. [Gap Keamanan (KRITIS)](#4-gap-keamanan-kritis)
5. [Gap Business Logic per PRD Rule](#5-gap-business-logic-per-prd-rule)
6. [Gap API Routes](#6-gap-api-routes)
7. [Gap UI / Halaman](#7-gap-ui--halaman)
8. [Gap Tech Stack & Dependencies](#8-gap-tech-stack--dependencies)
9. [Gap Testing](#9-gap-testing)
10. [Gap UX & Polish](#10-gap-ux--polish)
11. [Prioritas Implementasi](#11-prioritas-implementasi)
12. [Checklist Lengkap per Phase](#12-checklist-lengkap-per-phase)

---

## 1. Ringkasan Eksekutif

### Skor Kelengkapan per Area

| Area | Skor | Keterangan |
|------|:----:|------------|
| Auth & Middleware | 90% | JWT sudah berjalan, middleware aktif, login/register lengkap |
| Public Pages (Home, About, Kontak) | 85% | Halaman ada, desain bagus, beberapa tombol dead/tidak navigasi |
| Katalog & Detail Buku | 75% | Fungsional, kurang pagination dan validasi stok |
| Keranjang (Cart) | 40% | CRUD dasar ada, **business rules C1-C9 sebagian besar MISSING** |
| Checkout & Pesanan | 50% | Bisa membuat pesanan, **TIDAK ada transaction, stok check, race condition prevention** |
| Admin Panel | 65% | Semua halaman ada, **TIDAK ada auth guard di mayoritas API** |
| Midtrans Payment | 0% | Belum diimplementasi sama sekali |
| Upload & Compression | 30% | Upload dasar ada, TIDAK ada compression & validasi file |
| Testing | 0% | TIDAK ada test file satupun |
| Responsiveness Admin | 30% | Sidebar fixed, tidak ada mobile handling |

### Status Keseluruhan: **~55% Complete**

---

## 2. Perbedaan Arsitektur vs PRD

### 2.1 Folder Structure

| PRD Mengharapkan | Yang Ada | Status |
|------------------|----------|--------|
| `src/app/(public)/` — route group public | `app/` (langsung di root, tanpa route group) | ⚠️ Berbeda |
| `src/app/(user)/` — route group user | `app/` (tanpa group, langsung di root) | ⚠️ Berbeda |
| `src/app/admin/` | `app/admin/` | ✅ Sesuai |
| `src/components/ui/` (shadcn) | Tidak ada folder `components/ui/` | ❌ MISSING |
| `src/components/layout/` | `app/(marketing)/_components/` | ⚠️ Berbeda (masih OK) |
| `src/lib/` | `lib/` (tanpa `src/`) | ⚠️ Berbeda tapi fungsional |
| `src/types/index.ts` | Tidak ada | ❌ MISSING |
| `src/middleware.ts` | `middleware.ts` (root) | ✅ Fungsional |

**Catatan:** Project tidak menggunakan `src/` directory. Ini bukan masalah fungsional tapi berbeda dari PRD. Route grouping `(public)/(user)` juga tidak dipakai — halaman langsung di `app/`. Selama fungsional, ini acceptable.

### 2.2 Auth Architecture

| PRD Mengharapkan | Yang Ada | Status |
|------------------|----------|--------|
| NextAuth.js v5 (Auth.js) | Custom JWT (jose) + cookie manual | ⚠️ **BERBEDA** |
| `src/app/api/auth/[...nextauth]/route.ts` | `app/api/auth/login/`, `register/`, `logout/`, `me/` | ⚠️ Berbeda tapi fungsional |
| Session via NextAuth | JWT di HTTP-only cookie | ⚠️ Berbeda tapi aman |

**Catatan:** Project menggunakan custom JWT implementation daripada NextAuth.js v5. Ini secara teknis aman (HTTP-only cookie, bcrypt, jose), tapi berbeda dari spesifikasi PRD. Untuk USK, ini perlu didiskusikan apakah acceptable atau harus migrasi ke NextAuth.

### 2.3 Route Naming

| PRD Route | Route di Project | Status |
|-----------|-----------------|--------|
| `/books` | `/katalog` | ⚠️ Berbeda (Bahasa Indonesia) |
| `/books/[id]` | `/buku/[id]` | ⚠️ Berbeda (Indonesia) |
| `/cart` | `/keranjang` | ⚠️ Berbeda (Indonesia) |
| `/orders` | `/pesanan-saya` | ⚠️ Berbeda (Indonesia) |
| `/about` | `/tentang-kami` | ⚠️ Berbeda (Indonesia) |
| `/contact` | `/kontak` | ⚠️ Berbeda (Indonesia) |
| `/admin/categories` | `/admin/kategori-buku` | ⚠️ Berbeda (Indonesia) |
| `/admin/books` | `/admin/buku` | ⚠️ Berbeda (Indonesia) |
| `/admin/users` | `/admin/user` | ⚠️ Berbeda (Indonesia) |
| `/admin/orders` | `/admin/pesanan` | ⚠️ Berbeda (Indonesia) |

**Catatan:** Semua route menggunakan Bahasa Indonesia sesuai `copilot-instructions.md`. Ini konsisten dan sesuai arahan proyek.

---

## 3. Gap Prisma Schema vs PRD Data Model

### 3.1 Model yang Ada Tapi Berbeda dari PRD

| PRD Model | Schema Model | Perbedaan |
|-----------|-------------|-----------|
| `Users` (simple) | `User` (extended) | Schema menambahkan: `username`, `fotoProfilUrl`, `statusAkun` (enum), `nomorTelepon` — **lebih lengkap dari PRD** ✅ |
| `Categories` | `KategoriBuku` | Schema menambahkan: `deskripsi` — OK |
| `Books` | `Buku` | Schema: `harga` pakai `Decimal(10,2)` vs PRD `Int`. Menambahkan: `isbn`, `sinopsis`, `rating`, `statusAktif` (soft delete). **Tidak ada field `description`** — diganti `sinopsis` ✅ |
| `Orders` | `Pesanan` | **BERBEDA SIGNIFIKAN** — lihat detail di bawah |
| `Order Details` | `DetailPesanan` | Sesuai, harga di-snapshot ✅ |
| `Carts` | `Keranjang` + `ItemKeranjang` | PRD: 1 table. Schema: 2 table (header + items). **Lebih baik** ✅ |

### 3.2 Perbedaan Kritis pada Model Pesanan

| PRD Field | Schema Field | Status |
|-----------|-------------|--------|
| `status` (1 field VARCHAR) | `statusPembayaran` + `statusPesanan` (2 enum terpisah) | ⚠️ **BERBEDA** — PRD hanya 1 status field |
| `payment_proof` (VARCHAR) | `buktiPembayaranUrl` | ✅ Sesuai |
| `midtrans_order_id` (VARCHAR) | **TIDAK ADA** | ❌ **MISSING** — diperlukan untuk integrasi Midtrans |
| `resi` (VARCHAR) | **TIDAK ADA** | ❌ **MISSING** — diperlukan untuk nomor resi pengiriman |
| `shipping_address` (TEXT snapshot) | `idAlamat` (FK ke AlamatUser) | ⚠️ **BERBEDA** — PRD mau snapshot alamat di pesanan, schema gunakan referensi. Jika alamat di-edit setelah order, data pesanan lama berubah |

### 3.3 Enum yang Berbeda

| PRD Status | Schema StatusPesanan | Gap |
|------------|---------------------|-----|
| `Menunggu Pembayaran` | `menunggu_konfirmasi` | ⚠️ Nama berbeda |
| `Menunggu Verifikasi` | (tidak ada enum khusus) | ❌ MISSING |
| `Menunggu Pengiriman` | `diproses` | ⚠️ Nama berbeda |
| `Dikirim` | `dikirim` | ✅ |
| `Selesai` | `selesai` | ✅ |
| `Dibatalkan` | `dibatalkan` | ✅ |

| PRD Payment Method | Schema MetodePembayaran | Gap |
|--------------------|------------------------|-----|
| `COD` | `cod` | ✅ |
| `TRANSFER` | `transfer_bank` | ✅ |
| `MIDTRANS` | `ewallet`, `qris` | ⚠️ Berbeda — schema pisah e-wallet dan QRIS, PRD satukan sebagai Midtrans |

### 3.4 Model Tambahan (Tidak di PRD, Tapi Berguna)

| Model | Deskripsi | Status |
|-------|-----------|--------|
| `AlamatUser` | Alamat tersimpan user | ✅ Baik |
| `UlasanBuku` | Ulasan/review buku | ✅ Baik |
| `NotifikasiAdmin` | Notifikasi admin | ✅ Baik |
| `Pengeluaran` | Catatan pengeluaran | ✅ Baik untuk laporan |
| `PengaturanToko` | Setting toko (pajak, pembayaran) | ✅ Baik |
| `TarifOngkir` | Tarif ongkir per kota | ✅ Baik |
| `PesanKontak` | Pesan kontak dari form | ✅ Baik |

---

## 4. Gap Keamanan (KRITIS)

### 4.1 Admin API Tanpa Auth Guard 🔴

**Masalah:** Mayoritas endpoint admin **TIDAK memiliki pengecekan role**. Siapapun bisa mengakses dan memanipulasi data admin.

| Endpoint | Auth Guard? |
|----------|:-----------:|
| `GET/POST /api/admin/buku` | ❌ **TIDAK ADA** |
| `GET/PUT/DELETE /api/admin/buku/[id]` | ❌ **TIDAK ADA** |
| `GET/POST /api/admin/kategori-buku` | ❌ **TIDAK ADA** |
| `PUT/DELETE /api/admin/kategori-buku/[id]` | ❌ **TIDAK ADA** |
| `GET/POST /api/admin/user` | ❌ **TIDAK ADA** |
| `PUT/DELETE /api/admin/user/[id]` | ❌ **TIDAK ADA** |
| `GET/PUT /api/admin/pesanan/[id]` | ❌ **TIDAK ADA** |
| `GET /api/admin/pesanan` | ❌ **TIDAK ADA** |
| `GET /api/admin/dashboard` | ❌ **TIDAK ADA** |
| `GET /api/admin/laporan` | ❌ **TIDAK ADA** |
| `GET/PUT /api/admin/pengaturan` | ❌ **TIDAK ADA** |
| `GET/PATCH /api/admin/notifikasi` | ✅ Ada |
| `GET /api/admin/search` | ✅ Ada |

**Dampak:** User biasa bisa CRUD buku, hapus user, ubah pesanan, dll. Ini **vulnerability critical**.

### 4.2 Cart Ownership Check 🔴

| Endpoint | Ownership Check? |
|----------|:----------------:|
| `PUT /api/keranjang/[id]` | ❌ TIDAK — user bisa ubah cart item milik user lain |
| `DELETE /api/keranjang/[id]` | ❌ TIDAK — user bisa hapus cart item milik user lain |

### 4.3 Order Address Ownership 🔴

| Check | Status |
|-------|--------|
| Checkout: `idAlamat` milik user yang login? | ❌ TIDAK divalidasi |

### 4.4 Validasi Upload File

| Check | Status |
|-------|--------|
| MIME type validation (server-side) | ❌ MISSING |
| File size limit (server-side) | ❌ MISSING |
| File extension whitelist | ⚠️ Partial (hanya client-side accept attr) |
| Unique filename (prevent path traversal) | ✅ Menggunakan timestamp |
| Hapus file lama saat re-upload | ❌ MISSING |

### 4.5 Input Validation (Zod)

| Endpoint | Zod? |
|----------|:----:|
| `POST /api/auth/register` | ✅ |
| `POST /api/auth/login` | ✅ |
| `POST /api/admin/buku` | ❌ |
| `POST /api/admin/kategori-buku` | ❌ |
| `POST /api/keranjang` | ❌ |
| `POST /api/checkout` | ❌ |
| `PUT /api/admin/pesanan/[id]` | ❌ |
| `PUT /api/user/profile` | ❌ |
| `POST /api/kontak` | ❌ |

---

## 5. Gap Business Logic per PRD Rule

### 5.1 Auth & User (A1–A7)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| A1 | Email unik | ✅ | Dicek di register API |
| A2 | Password hashing | ✅ | bcryptjs digunakan |
| A3 | Konfirmasi password | ✅ | Dicek di client (register form) |
| A4 | Login error generik | ✅ | Pesan "email/username atau kata sandi salah" |
| A5 | Session expired redirect | ✅ | Middleware redirect ke `/login` |
| A6 | Role guard | ⚠️ | Middleware proteksi route OK, tapi **admin bisa checkout** (tidak diblokir di API) |
| A7 | Login redirect | ✅ | Middleware redirect ke home jika sudah login |

### 5.2 Buku & Kategori (B1–B7)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| B1 | Kategori tidak bisa dihapus jika punya buku | ✅ | Dicek di API delete |
| B2 | Buku tidak bisa dihapus jika di pesanan aktif | ❌ | Soft-delete tanpa cek pesanan aktif |
| B3 | Harga > 0 | ❌ | Tidak ada validasi di API |
| B4 | Stok >= 0 | ❌ | Tidak ada constraint database |
| B5 | Nama kategori unik | ❌ | Bisa buat duplikat |
| B6 | Gambar wajib | ❌ | Tidak divalidasi di API |
| B7 | Tahun valid | ❌ | Tidak divalidasi |

### 5.3 Keranjang / Cart (C1–C9)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| C1 | Quantity ≤ stok | ❌ | **TIDAK ADA** cek stok di add/update cart |
| C2 | Quantity minimal 1 | ❌ | Tidak ada validasi quantity |
| C3 | Duplikat → increment | ✅ | Sudah dihandle di POST cart |
| C4 | Stok habis → disabled | ⚠️ | UI ada disabled, tapi API tidak cek |
| C5 | Stok berkurang → auto-adjust | ❌ | **TIDAK ADA** auto-adjust |
| C6 | Buku dihapus → auto-remove | ❌ | **TIDAK ADA** auto-remove |
| C7 | Harus login | ✅ | Auth check di API |
| C8 | total_price dihitung ulang | ⚠️ | Partial — harga buku diambil tapi tidak selalu dihitung ulang |
| C9 | Cart kosong → tidak bisa checkout | ✅ | Dicek di UI checkout page |

### 5.4 Checkout & Order (D1–D10)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| D1 | Validasi stok final saat checkout | ❌ | **TIDAK ADA** re-check stok |
| D2 | Stok dikurangi saat order dibuat | ⚠️ | Ada pengurangan stok, tapi **TIDAK dalam transaction** |
| D3 | Race condition prevention | ❌ | **TIDAK ADA** locking atau transaction |
| D4 | Alamat pengiriman wajib | ✅ | `idAlamat` required |
| D5 | Harga di-snapshot | ✅ | `hargaSatuan` disimpan di DetailPesanan |
| D6 | Subtotal dihitung server | ✅ | Dihitung di checkout API |
| D7 | total_payment dihitung server | ✅ | Dihitung di checkout API |
| D8 | Cart dikosongkan setelah order | ✅ | Cart items dihapus setelah order |
| D9 | Order code unik | ✅ | Format `INV-YYYYMMDD-XXXX` (berbeda dari PRD `ORD-` tapi unique) |
| D10 | User hanya lihat pesanannya | ✅ | Filter by `idUser` di API |

### 5.5 Pembayaran — COD (E1–E2)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| E1 | Status awal: Menunggu Pengiriman | ⚠️ | Set ke `diproses` + `terkonfirmasi` — mapping berbeda |
| E2 | Tidak perlu upload bukti | ✅ | `buktiPembayaranUrl` null |

### 5.6 Pembayaran — Transfer Bank (F1–F7)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| F1 | Status awal: Menunggu Pembayaran | ⚠️ | Set ke `menunggu_konfirmasi` — mapping berbeda dari PRD |
| F2 | Upload bukti wajib sebelum verifikasi | ✅ | Ada endpoint upload |
| F3 | Validasi file upload (tipe, compress) | ❌ | **TIDAK ADA** validasi server-side atau compression |
| F4 | Re-upload bukti | ⚠️ | Bisa upload ulang tapi tidak cek status |
| F5 | Status berubah ke Menunggu Verifikasi | ⚠️ | Berubah ke `menunggu_konfirmasi` di pembayaran |
| F6 | Admin verifikasi → terima/tolak | ⚠️ | Admin bisa ubah status tapi tanpa transition rules |
| F7 | Batas waktu 24 jam → auto batal + stok dikembalikan | ❌ | **TIDAK ADA** cron/auto-cancel |

### 5.7 Pembayaran — Midtrans (G1–G6)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| G1 | Status awal + midtrans_order_id | ❌ | **TIDAK ADA** — Midtrans belum diimplementasi |
| G2 | Generate snap token | ❌ | **TIDAK ADA** |
| G3 | Webhook signature verification | ❌ | **TIDAK ADA** |
| G4 | Webhook idempotency | ❌ | **TIDAK ADA** |
| G5 | Status mapping dari Midtrans | ❌ | **TIDAK ADA** |
| G6 | Transaction expiry handling | ❌ | **TIDAK ADA** |

### 5.8 Status Transition Rules (12.8)

| Validasi | Status | Detail |
|----------|:------:|--------|
| Transisi status sesuai flow PRD | ❌ | Admin bisa set status APAPUN tanpa validasi |
| Status final (Selesai/Dibatalkan) tidak bisa diubah | ❌ | Tidak dicek |
| Pembatalan → stok dikembalikan | ❌ | Stok **TIDAK** dikembalikan saat batal |
| Resi wajib saat kirim (I1) | ❌ | Tidak dicek |

### 5.9 Stok Lifecycle (12.9)

| Event | Status | Detail |
|-------|:------:|--------|
| Checkout → stok -= quantity | ⚠️ | Ada tapi BUKAN dalam transaction |
| Batal → stok += quantity | ❌ | **TIDAK ADA** pengembalian stok |
| Midtrans expire → stok += quantity | ❌ | Midtrans belum ada |
| Transfer timeout → stok += quantity | ❌ | Auto-cancel belum ada |
| Admin tolak bukti → stok tidak berubah | ❌ | Belum diimplementasi |

### 5.10 Upload & Compression (H1–H7)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| H1 | Tipe file whitelist | ❌ | Tidak divalidasi di server |
| H2 | Client-side compression | ❌ | `browser-image-compression` tidak diinstall |
| H3 | Max size setelah compress | ❌ | Tidak ada |
| H4 | Validasi MIME type server | ❌ | Tidak ada |
| H5 | Unique filename | ✅ | Pakai timestamp |
| H6 | Hapus file lama | ❌ | File lama tidak dihapus |
| H7 | Storage path | ✅ | `public/uploads/` |

### 5.11 Admin Edge Cases (I1–I4)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| I1 | Resi wajib saat ubah ke Dikirim | ❌ | Tidak dicek |
| I2 | Admin tidak bisa hapus dirinya | ❌ | Tidak dicek |
| I3 | Dashboard hitung dari pesanan Selesai saja | ⚠️ | Menghitung semua pesanan terkonfirmasi |
| I4 | Pagination semua daftar | ❌ | **TIDAK ADA pagination** di semua halaman |

### 5.12 Concurrency & Data Integrity (J1–J4)

| Rule | Deskripsi | Status | Detail |
|------|-----------|:------:|--------|
| J1 | Checkout dalam 1 transaction | ❌ | **TIDAK menggunakan `prisma.$transaction`** |
| J2 | Pembatalan + stok dalam 1 transaction | ❌ | Tidak ada |
| J3 | Frontend optimistic → server validates | ⚠️ | Partial |
| J4 | Harga selalu dari database | ✅ | Harga diambil dari DB saat checkout |

---

## 6. Gap API Routes

### 6.1 API yang Belum Ada (Required by PRD)

| API | Deskripsi | Status |
|-----|-----------|--------|
| `POST /api/payment/midtrans` | Buat transaksi Midtrans Snap | ❌ MISSING |
| `POST /api/payment/midtrans/callback` | Webhook dari Midtrans | ❌ MISSING |
| `GET /api/categories` (public) | List kategori publik | ⚠️ Hanya ada di admin |
| `POST /api/orders/[id]/upload-proof` | Upload bukti (PRD format) | ⚠️ Ada tapi di path berbeda |
| `PUT /api/admin/orders/[id]/status` | Update status pesanan | ⚠️ Ada tapi langsung di `PUT /api/admin/pesanan/[id]` |

### 6.2 API Duplikat yang Harus Dikonsolidasi

| Endpoint 1 | Endpoint 2 | Aksi |
|------------|------------|------|
| `POST /api/user/pesanan/[id]/upload-bukti` | `POST /api/pesanan/[id]/bukti-pembayaran` | Hapus salah satu, pertahankan yang lebih baik |

### 6.3 Masalah Validasi API

| Endpoint | Masalah |
|----------|---------|
| `POST /api/admin/buku` | FormData extraction tanpa Zod, tidak validasi harga > 0, stok >= 0 |
| `POST /api/admin/kategori-buku` | Tidak cek nama unik (B5) |
| `POST /api/keranjang` | Tidak cek stok (C1), tidak cek buku aktif (C4) |
| `POST /api/checkout` | Tidak cek stok (D1), tidak dalam transaction (J1) |
| `PUT /api/admin/pesanan/[id]` | Bisa set status apapun (harusnya ada transition rules) |

---

## 7. Gap UI / Halaman

### 7.1 Halaman yang Ada Tapi Bermasalah

| Halaman | Masalah |
|---------|---------|
| **Home** (`app/page.tsx`) | Tombol CTA "Daftar Gratis", "Lihat Promo" **tidak navigasi** (dead buttons) |
| **Hero** | Tombol "Lihat Katalog" dan "Daftar Sekarang" **tidak navigasi** |
| **Katalog** | Tidak ada **pagination**, `window.location.reload()` setelah add to cart |
| **Detail Buku** | `alert()` untuk notifikasi, `window.location.reload()` |
| **Keranjang** | `confirm()` untuk delete, `window.location.reload()` |
| **Checkout** | Mengakses `/api/admin/pengaturan` — mungkin gagal jika auth guard ditambahkan nanti |
| **Pesanan Saya** | Tidak ada pagination, tidak ada filter status |
| **Detail Pesanan** | Status timeline tidak handle `belum_dibayar`/`menunggu_pembayaran` |
| **Profil** | `alert()` untuk notifikasi, `window.location.reload()` |
| **Upload Bukti** | Tidak ada validasi ukuran file client-side |
| **Admin Layout** | Sidebar fixed 72px, **tidak responsive/mobile** |
| **Admin Dashboard** | Tombol "Lihat Semua" dead button |
| **Admin Kategori** | `colSpan` mismatch (4 vs 5 kolom) |
| **Admin Pesanan** | Tombol "Process" logic salah (tampil di status yang salah) |
| **Admin Laporan** | Tombol "Export CSV" dead button |
| **Login** | Demo credentials ditampilkan (hapus untuk production) |

### 7.2 Fitur UI yang Belum Ada

| Fitur | Deskripsi | PRD Ref |
|-------|-----------|---------|
| Toast notifications (Sonner) | Semua notifikasi masih pakai `alert()` | PRD Tech Stack |
| Client-side image compression | Belum install `browser-image-compression` | H2 |
| Pagination (semua tabel/list) | Tidak ada di satu pun halaman | I4 |
| Admin responsive/mobile | Sidebar tidak bisa collapsed | - |
| Empty state kreatif | Beberapa halaman sudah bagus, beberapa masih basic | Dev Plan |
| Midtrans Snap popup | Belum ada integrasi Midtrans | G1-G6 |
| Order status filter di pesanan user | Belum ada filter/tab status | 4.10 |

---

## 8. Gap Tech Stack & Dependencies

### 8.1 Dependencies yang Belum Diinstall

| Library | Required By | Status |
|---------|-------------|--------|
| `next-auth` (v5 / Auth.js) | PRD Tech Stack | ❌ Tidak dipakai (custom JWT) |
| `midtrans-client` | PRD Section 9 (Midtrans) | ❌ MISSING |
| `browser-image-compression` | PRD Rule H2 | ❌ MISSING |
| `sonner` (toast) | PRD Tech Stack | ❌ MISSING |
| `shadcn/ui` | PRD Tech Stack | ❌ MISSING |
| `vitest` | Dev Plan Testing | ❌ MISSING |
| `@testing-library/react` | Dev Plan Testing | ❌ MISSING |
| `msw` (Mock Service Worker) | Dev Plan Testing | ❌ MISSING |

### 8.2 Dependencies yang Ada Tapi Bukan di PRD

| Library | Alasan Dipakai |
|---------|---------------|
| `jose` | Sebagai pengganti NextAuth untuk JWT verification |
| `recharts` | Chart di admin dashboard |
| `framer-motion` | Animasi sesuai copilot-instructions |

---

## 9. Gap Testing

### Status: TIDAK ADA TEST SAMA SEKALI

- ❌ Tidak ada folder `tests/`
- ❌ Tidak ada file `*.test.ts` atau `*.test.tsx`
- ❌ Tidak ada `vitest.config.ts`
- ❌ Tidak ada script `test` di `package.json`
- ❌ Tidak ada `@testing-library/react` atau `vitest` di dependencies
- ❌ Tidak ada MSW setup

### Test yang Dibutuhkan per Development Plan

| Phase | Test File | Test Cases |
|-------|-----------|------------|
| 0 | `prisma-schema.test.ts` | Model existence, relations, enum values |
| 1 | `utils.test.ts` | `formatRupiah`, `generateOrderCode` |
| 1 | `transitions.test.ts` | Status transition mapping |
| 2 | `register.test.ts` | A1 (duplikat), A2 (hash), A3 (validasi), role default |
| 2 | `auth.test.ts` | Schema validation |
| 3 | UI tests register/login | Form render, validation, submit |
| 4 | `navbar.test.tsx` | Links, auth state, cart badge |
| 5 | `book-card.test.tsx` | Render, format harga |
| 6 | `books/route.test.ts` | Pagination, filter, search |
| 8 | `cart/route.test.ts` | C1-C9 (18+ test cases) |
| 10 | `checkout.test.ts` | D1-D10, E1, F1, G1, J1, J4 (17+ test cases) |
| 14 | `midtrans.test.ts` | Webhook, signature |
| 19 | `order-status.test.ts` | Transition rules (13+ tests) |
| 22 | Integration tests | Full flow: register → add to cart → checkout |

---

## 10. Gap UX & Polish

### 10.1 Konsistensi UX

| Masalah | Lokasi | Solusi |
|---------|--------|--------|
| `alert()` untuk notifikasi | Detail buku, keranjang, profil, upload bukti, kontak | Ganti dengan Sonner toast |
| `window.location.reload()` | Katalog, detail buku, keranjang, profil | Ganti dengan React state update / router.refresh() |
| `confirm()` untuk delete | Keranjang | Ganti dengan modal dialog |
| Dead buttons (tidak navigasi) | Hero, Home CTA, Dashboard "Lihat Semua" | Tambahkan `Link` atau `onClick` handler |

### 10.2 Responsiveness

| Halaman | Mobile Support |
|---------|:--------------:|
| Home/Landing | ✅ |
| About | ✅ |
| Login/Register | ✅ |
| Katalog | ✅ |
| Keranjang | ✅ |
| Checkout | ✅ |
| Admin Panel | ❌ Sidebar fixed, tidak collapsible |

### 10.3 Loading & Error States

| Halaman | Loading | Error State |
|---------|:-------:|:-----------:|
| Katalog | ✅ Skeleton | ⚠️ Tidak ada error display |
| Detail Buku | ✅ Skeleton | ✅ "Tidak ditemukan" |
| Keranjang | ✅ Skeleton | ⚠️ Minimal |
| Checkout | ✅ Skeleton | ⚠️ Minimal |
| Admin Dashboard | ✅ Spinner | ✅ "Gagal memuat" |
| Admin Buku | ✅ Skeleton | ⚠️ Minimal |
| Admin Pesanan | ✅ Spinner | ⚠️ Minimal |
| Admin Pesanan Detail | ⚠️ Text saja | ⚠️ Text saja |

---

## 11. Prioritas Implementasi

### 🔴 Prioritas KRITIS (Harus Segera)

| # | Task | PRD Rules | Alasan |
|---|------|-----------|--------|
| 1 | **Tambahkan admin auth guard** ke SEMUA `/api/admin/*` routes | A6 | Vulnerability critical — semua data bisa dimanipulasi |
| 2 | **Wrap checkout dalam `prisma.$transaction`** + validasi stok | D1, D2, D3, J1 | Data integrity — stok bisa negatif, race condition |
| 3 | **Tambahkan validasi stok** di cart add/update | C1, C4 | User bisa add lebih dari stok |
| 4 | **Tambahkan cart ownership check** di PUT/DELETE | Security | User bisa manipulasi cart orang lain |
| 5 | **Implementasi stok restore pada pembatalan** | 12.8, 12.9, J2 | Stok hilang permanen jika order dibatalkan |
| 6 | **Implementasi status transition rules** | 12.8 | Admin bisa set status apapun termasuk dari Selesai ke Diproses |

### 🟡 Prioritas TINGGI

| # | Task | PRD Rules | Alasan |
|---|------|-----------|--------|
| 7 | Tambahkan Zod validation di semua API | 10 (Keamanan) | Input tidak tervalidasi |
| 8 | Tambahkan pagination di semua list/table | I4 | Performance dengan banyak data |
| 9 | Install & implementasi Sonner (toast) | Tech Stack | UX konsisten |
| 10 | Fixing dead buttons (Hero CTA, etc) | UX | First impression rusak |
| 11 | Implementasi file upload validation (server-side) | H1, H4 | Bisa upload file berbahaya |
| 12 | Tambahkan `resi` dan `midtrans_order_id` di schema Pesanan | 6, G1 | Data model tidak lengkap |
| 13 | Snapshot alamat di pesanan (bukan FK) | D5 analog | Alamat bisa berubah post-order |

### 🟢 Prioritas SEDANG

| # | Task | PRD Rules | Alasan |
|---|------|-----------|--------|
| 14 | Install & implement `browser-image-compression` | H2, H3 | Optimisasi upload |
| 15 | Admin sidebar responsive/mobile | UX | Admin tidak bisa diakses di mobile |
| 16 | Implementasi Midtrans payment | G1-G6 | Payment gateway |
| 17 | Ganti `window.location.reload()` dengan state update | UX | UX jerky |
| 18 | Implementasi auto-cancel 24 jam (cron) | F7, G6 | Order menggantung |
| 19 | Implementasi B2 (cek pesanan aktif saat delete buku) | B2 | Bisa hapus buku yang masih di pesanan |
| 20 | Implementasi B5 (nama kategori unik) | B5 | Duplikat kategori |
| 21 | Setup testing framework (Vitest + RTL + MSW) | Dev Plan | Belum ada test |

### 🔵 Prioritas RENDAH

| # | Task | PRD Rules |
|---|------|-----------|
| 22 | Tambahkan B3 (harga > 0), B4 (stok >= 0), B6 (gambar wajib), B7 (tahun valid) | B3-B7 |
| 23 | Implementasi I2 (admin tidak bisa hapus dirinya) | I2 |
| 24 | Export CSV di admin laporan | Fungsional |
| 25 | Hapus demo credentials dari halaman login | Security minor |
| 26 | Fix colSpan mismatch di admin kategori | UI bug |
| 27 | Fix admin pesanan "process" button logic | UI bug |
| 28 | Konsolidasi endpoint duplikat upload bukti | Clean code |

---

## 12. Checklist Lengkap per Phase (Development Plan)

### Phase 0: Inisialisasi & Setup
- [x] Next.js App Router project running
- [x] Prisma schema + MySQL connected
- [x] Prisma migrations created
- [ ] ~~shadcn/ui installed~~ — **BELUM**
- [ ] ~~Vitest + RTL + MSW setup~~ — **BELUM**
- [ ] ~~Test script di package.json~~ — **BELUM**

### Phase 1: Seed Data & Utilities
- [x] Seed data (admin + sample books + categories)
- [ ] ~~`formatRupiah()` util~~ — **Perlu verifikasi**
- [ ] ~~`generateOrderCode()` util~~ — **Ada di checkout tapi bukan reusable**
- [ ] ~~TypeScript types/interfaces~~ — **BELUM ADA** `types/index.ts`
- [ ] ~~VALID_TRANSITIONS mapping~~ — **BELUM ADA**

### Phase 2: Auth Configuration
- [x] Register API (email unik, hash, validasi)
- [x] Login API (generik error)
- [x] JWT + HTTP-only cookie
- [x] Middleware route protection
- [ ] ~~NextAuth v5 integration~~ — **Custom JWT (berbeda)**

### Phase 3: Auth UI
- [x] Login page functional
- [x] Register page functional
- [ ] ~~Split-screen layout~~ — **Standard centered layout**
- [ ] ~~Custom Google Fonts (distinctive)~~ — **Inter + Libre Baskerville (acceptable)**
- [ ] ~~Micro-animation form load~~ — **Minimal**

### Phase 4: Layout (Navbar & Footer)
- [x] Navbar with auth state
- [x] Cart badge in navbar
- [x] Footer
- [x] Mobile hamburger menu
- [ ] ~~Navbar blur on scroll~~ — **Perlu verifikasi**

### Phase 5: Home Page
- [x] Hero section
- [x] Book showcase
- [x] Categories section
- [x] Best sellers
- [x] Testimonials
- [ ] ~~Dead buttons fixed~~ — **BELUM**
- [ ] ~~Loading skeleton~~ — **BELUM ADA** `loading.tsx`

### Phase 6: Katalog & Detail Buku
- [x] Search by judul/penulis
- [x] Filter by kategori
- [x] Sort (terbaru/terlaris/termurah)
- [x] Detail buku page
- [x] Review/ulasan system
- [ ] ~~Pagination~~ — **BELUM**
- [ ] ~~Stok habis → disabled (API-validated)~~ — **UI only**

### Phase 7: About & Contact
- [x] About Us page (polished)
- [x] Contact form
- [x] Contact saves to DB (bonus, PRD says WA only)
- [ ] ~~WhatsApp number from env~~ — **Hardcoded**

### Phase 8: Cart API
- [x] GET cart items
- [x] POST add to cart
- [x] PUT update qty
- [x] DELETE remove item
- [ ] ~~C1: Qty ≤ stok~~ — **BELUM**
- [ ] ~~C2: Qty minimal 1 / auto-delete~~ — **BELUM**
- [ ] ~~C5: Auto-adjust stok berubah~~ — **BELUM**
- [ ] ~~C6: Auto-remove buku dihapus~~ — **BELUM**
- [ ] ~~Ownership check~~ — **BELUM**

### Phase 9: Cart UI
- [x] Cart page rendering
- [x] Quantity controls (+/-)
- [x] Remove item
- [x] Total calculation
- [ ] ~~Toast notifications~~ — **Pakai alert()**
- [ ] ~~Animated badge update~~ — **reload()** instead

### Phase 10: Checkout API (KRITIS)
- [x] Order creation basic flow
- [x] Price snapshot in DetailPesanan
- [x] Cart cleanup after order
- [ ] ~~`prisma.$transaction` wrapping~~ — **BELUM**
- [ ] ~~Stock validation before checkout~~ — **BELUM**
- [ ] ~~Race condition prevention~~ — **BELUM**
- [ ] ~~Status awal sesuai payment method~~ — **Partial**

### Phase 11: Checkout UI
- [x] Address selection
- [x] Payment method selection
- [x] Order summary
- [ ] ~~Midtrans Snap trigger~~ — **BELUM**

### Phase 12: Riwayat & Detail Pesanan
- [x] Orders list page
- [x] Order detail page
- [x] Status timeline/stepper
- [ ] ~~Filter by status~~ — **BELUM**
- [ ] ~~Pagination~~ — **BELUM**

### Phase 13: Upload Transfer
- [x] Upload bukti form
- [ ] ~~Client-side compression~~ — **BELUM**
- [ ] ~~File type/size validation (server)~~ — **BELUM**
- [ ] ~~Hapus file lama~~ — **BELUM**

### Phase 14: Midtrans Integration
- [ ] ~~Snap token generation~~ — **BELUM**
- [ ] ~~Snap popup frontend~~ — **BELUM**
- [ ] ~~Webhook callback~~ — **BELUM**
- [ ] ~~Signature verification~~ — **BELUM**
- [ ] ~~Status mapping~~ — **BELUM**
- [ ] ~~Idempotency~~ — **BELUM**

### Phase 15: Admin Dashboard
- [x] KPI cards
- [x] Sales chart
- [x] Notifications
- [x] Recent orders
- [ ] ~~Auth guard~~ — **BELUM**
- [ ] ~~Only "Selesai" orders in revenue (I3)~~ — **Semua terkonfirmasi**

### Phase 16: Admin Kategori
- [x] CRUD functional
- [x] B1 (delete protection)
- [ ] ~~B5 (unique name)~~ — **BELUM**
- [ ] ~~Auth guard~~ — **BELUM**
- [ ] ~~Zod validation~~ — **BELUM**

### Phase 17: Admin Buku
- [x] CRUD functional
- [x] Cover upload
- [x] Soft delete
- [ ] ~~B2 (active order check)~~ — **BELUM**
- [ ] ~~B3 (harga > 0)~~ — **BELUM**
- [ ] ~~Auth guard~~ — **BELUM**

### Phase 18: Admin User
- [x] List, create, edit, delete user
- [ ] ~~I2 (admin tidak hapus diri)~~ — **BELUM**
- [ ] ~~Auth guard~~ — **BELUM**

### Phase 19: Admin Pesanan
- [x] List orders
- [x] Detail pesanan + update status
- [x] Print invoice
- [ ] ~~Status transition validation~~ — **BELUM**
- [ ] ~~Stok restore on cancel~~ — **BELUM**
- [ ] ~~I1 (resi wajib saat kirim)~~ — **BELUM**
- [ ] ~~Auth guard~~ — **BELUM**

### Phase 20: Cron Auto-Cancel
- [ ] ~~Transfer timeout 24 jam~~ — **BELUM**
- [ ] ~~Midtrans expire handling~~ — **BELUM**
- [ ] ~~Stok restore on auto-cancel~~ — **BELUM**

### Phase 21: Polish
- [ ] ~~404 page custom~~ — **BELUM**
- [ ] ~~Loading states konsisten~~ — **Partial**
- [ ] ~~Error boundaries~~ — **BELUM**
- [ ] ~~SEO metadata per halaman~~ — **Partial (root layout only)**

### Phase 22: Final & Testing
- [ ] ~~80%+ test coverage~~ — **0%**
- [ ] ~~Responsive di semua viewport~~ — **Admin tidak responsive**
- [ ] ~~Integration tests~~ — **BELUM**

---

## Catatan Akhir

Project ini memiliki **fondasi yang baik** — semua halaman utama sudah ada, auth berjalan, CRUD admin lengkap, dan desain UI cukup polished. Namun ada **gap signifikan** di area:

1. **Keamanan** — Admin API tanpa auth guard, ownership checks missing
2. **Data Integrity** — Checkout tanpa transaction, stok tidak divalidasi
3. **Business Rules** — Banyak rules C1-C9, D1-D10, F1-F7 yang belum diimplementasi
4. **Payment Gateway** — Midtrans belum ada sama sekali
5. **Testing** — Tidak ada test sama sekali

Untuk memenuhi standar USK (Uji Sertifikasi Kompetensi), priorities 1-6 dari bagian "Prioritas KRITIS" **harus diselesaikan** karena menyangkut keamanan dan integritas data.
