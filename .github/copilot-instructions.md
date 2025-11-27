# Copilot Instructions – BukuCerdas

## Tujuan Proyek
- Membangun aplikasi web toko buku online bernama **BukuCerdas**.
- Tech stack:
  - Next.js (App Router) + TypeScript
  - Tailwind CSS untuk styling
  - framer-motion untuk animasi UI
  - Prisma + MySQL (Laragon) sebagai database
- Bahasa utama untuk UI dan penamaan database: **Bahasa Indonesia**.

## Konvensi & Arsitektur

1. **Next.js App Router**
   - Gunakan folder `app/` dengan struktur:
     - Landing & About: `app/page.tsx`, `app/tentang-kami/page.tsx`
     - Auth: `app/login/page.tsx`, `app/register/page.tsx`
     - User:
       - `app/katalog/page.tsx`
       - `app/buku/[id]/page.tsx`
       - `app/keranjang/page.tsx`
       - `app/checkout/page.tsx`
       - `app/profil/page.tsx`
       - `app/pesanan-saya/page.tsx`
     - Admin (layout khusus):
       - `app/admin/layout.tsx`
       - `app/admin/dashboard/page.tsx`
       - `app/admin/kategori-buku/page.tsx`
       - `app/admin/buku/page.tsx`
       - `app/admin/user/page.tsx`
       - `app/admin/pesanan/page.tsx`
       - `app/admin/laporan/page.tsx`
       - `app/admin/pengaturan/page.tsx`
   - Pisahkan komponen kecil ke dalam folder `app/(marketing)/_components`, `app/(user)/_components`, `app/(admin)/_components` atau `components/` global.

2. **Database & Prisma**
   - Gunakan prisma schema dengan nama model dan field berbahasa Indonesia:
     - `User`, `KategoriBuku`, `Buku`, `AlamatUser`, `Pesanan`, `DetailPesanan`, `UlasanBuku`, `NotifikasiAdmin`, `PengaturanToko`, `TarifOngkir`, `PesanKontak`.
   - Tetap ikuti gaya penamaan Prisma (camelCase di field), tetapi nama field harus Indonesia, misal:
     - `namaLengkap`, `kataSandiHash`, `tanggalDaftar`, `statusAkun`, `namaKategori`, `coverUrl`, `pajakPersen`, `biayaOngkir`, dll.
   - Setiap kali Copilot membuat model atau kolom baru, utamakan nama Bahasa Indonesia dan konsisten dengan pola yang sudah ada.

3. **Autentikasi & Keamanan**
   - Gunakan JWT yang disimpan di cookie HTTP-only.
   - Role: `"admin"` dan `"user"`.
   - Buat helper untuk:
     - Mengambil user dari token JWT.
     - Mengecek role dan mem-block akses jika tidak sesuai.
   - Jangan pernah menyimpan password plaintext; gunakan bcrypt (hash).
   - Jangan tampilkan informasi sensitif (hash, token) di response API.

4. **API Routes**
   - Semua operasi server-side (CRUD, auth, checkout) harus lewat API Routes Next.js di `app/api/**`.
   - Penamaan endpoint pakai Bahasa Indonesia jika masuk akal, contoh:
     - `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
     - `/api/admin/buku`, `/api/admin/kategori-buku`, `/api/admin/pesanan`
     - `/api/user/keranjang`, `/api/user/alamat`, `/api/user/pesanan`
   - Response JSON harus memakai key Bahasa Indonesia dan pesan error/sukses juga dalam bahasa Indonesia.

5. **UI, Tailwind & Animasi**
   - Jangan membuat styling manual berbasis CSS murni panjang jika bisa dicapai dengan Tailwind utility classes.
   - Gunakan framer-motion untuk:
     - Animasi masuk section (fade, slide).
     - Hover/press effect tombol dan kartu.
   - Landing dan About Us sudah punya desain dasar dari export Aura/Vite; jaga struktur dan nuansa desain tersebut ketika memodifikasi komponen.

6. **Fitur Utama yang Harus Dijaga**
   - Role Admin:
     - CRUD Kategori Buku & Buku (termasuk upload cover dan URL cover).
     - List & kelola User.
     - List & kelola Pesanan (konfirmasi pembayaran, update status, cetak invoice).
     - Dashboard dengan grafik pembelian, notifikasi pesanan, dan ringkasan.
     - Laporan pemasukan/pengeluaran + pengaturan pajak dan metode pembayaran.
   - Role User:
     - Registrasi, login.
     - Lihat Landing & About Us.
     - Katalog buku + pencarian & filter.
     - Detail buku + ulasan (hanya setelah membeli).
     - Keranjang & checkout (COD / pembayaran online dengan upload bukti).
     - Alamat tersimpan yang bisa diedit.
     - Profil & foto profil.
     - Riwayat & tracking status pesanan.
     - Kirim pesan ke admin + tombol chat WhatsApp admin.

7. **Gaya Kode**
   - Gunakan TypeScript dan tipe yang jelas di API handler dan komponen penting.
   - Pisahkan logika bisnis ke helper/service functions bila mulai kompleks.
   - Utamakan code yang mudah dibaca dan mudah diuji daripada trik singkat.
   - Komentar singkat pakai Bahasa Indonesia untuk bagian logika yang sulit.

8. **Hal-hal yang Harus Dihindari**
   - Jangan mengubah nama tabel/field yang sudah ada kecuali diminta eksplisit.
   - Jangan mencampur gaya penamaan (hindari campuran Inggris-Indonesia).
   - Jangan membuat halaman baru tanpa menambahkan route di App Router dengan struktur yang sudah disepakati.
   - Jangan menambahkan library berat yang tidak perlu (misalnya UI kit besar) tanpa alasan kuat.

Dengan instruksi ini, setiap kali melengkapi kode:
- Copilot harus menjaga konsistensi nama Indonesia.
- Mengikuti arsitektur Next.js App Router + Prisma.
- Mengutamakan keamanan dasar (auth, role, validasi input).
