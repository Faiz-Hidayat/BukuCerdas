# Product Requirements Document (PRD)

## Aplikasi BookStore — Uji Sertifikasi Kompetensi (USK)

**Skema Sertifikasi:** Pengembang Web Pratama (Junior Web Developer)
**Nomor Skema:** 020403
**Tech Stack:** Next.js (Full-stack)
**Tanggal:** April 2026

---

## 1. Ringkasan Proyek

Membangun aplikasi toko buku berbasis web (BookStore) sebagai tugas praktik demonstrasi untuk Uji Sertifikasi Kompetensi Junior Web Developer (BNSP). Aplikasi memiliki **2 aktor utama**: **Admin** dan **User**. Aplikasi mencakup fitur manajemen buku, keranjang belanja, dan sistem pembayaran.

### Unit Kompetensi yang Dicakup

| Kode Unit | Judul Unit |
|---|---|
| J.620100.005.02 | Mengimplementasikan User Interface |
| J.620100.010.01 | Menerapkan perintah eksekusi bahasa pemrograman berbasis teks, grafik, dan multimedia |
| J.620100.015.01 | Menyusun fungsi, file atau sumber daya pemrograman yang lain dalam organisasi yang rapi |
| J.620100.016.01 | Menulis kode dengan prinsip sesuai guidelines dan best practices |
| J.620100.017.02 | Mengimplementasikan pemrograman terstruktur |
| J.620100.019.02 | Menggunakan library atau komponen pre-existing |

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript |
| UI Components | shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS v4 |
| Database | MySQL |
| ORM | Prisma |
| Authentication | NextAuth.js v5 (Auth.js) |
| Validation | Zod |
| Payment Gateway | Midtrans (Snap) |
| Toast/Notification | Sonner |
| File Upload | Local storage (public/uploads) + browser-image-compression |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 3. Aktor & Role

| Aktor | Deskripsi |
|---|---|
| **Admin** | Mengelola seluruh data buku, kategori, melihat daftar user, memantau pesanan, dan menerima pesan via WhatsApp |
| **User** | Mendaftar, login, melihat & mencari buku, memasukkan ke keranjang, dan melakukan pembelian |

---

## 4. Fitur — User

### 4.1 Registrasi User

| Item | Detail |
|---|---|
| Deskripsi | User membuat akun baru untuk mengakses aplikasi |
| Input | Nama lengkap, Email, No. Telepon, Alamat, Password, Konfirmasi Password |
| Validasi | Email unik, password min 8 karakter, konfirmasi password cocok, telepon valid |
| Output | Akun terbuat, redirect ke halaman login |

### 4.2 Login User

| Item | Detail |
|---|---|
| Deskripsi | User masuk ke aplikasi menggunakan email dan password |
| Input | Email, Password |
| Validasi | Kredensial valid |
| Output | Session aktif, redirect ke halaman Home |
| Catatan | Menggunakan NextAuth.js dengan credentials provider |

### 4.3 Halaman Home

| Item | Detail |
|---|---|
| Deskripsi | Halaman utama menampilkan daftar buku yang tersedia dan informasi umum aplikasi |
| Konten | Hero section, daftar buku terbaru/populer, kategori buku |
| Akses | Public (tanpa login) |

### 4.4 Halaman About Us

| Item | Detail |
|---|---|
| Deskripsi | Menampilkan informasi tentang toko buku |
| Konten | Deskripsi toko, visi misi, tim |
| Akses | Public |

### 4.5 Contact to Admin (WhatsApp Redirect)

| Item | Detail |
|---|---|
| Deskripsi | User mengirim pesan kepada admin melalui WhatsApp |
| Input | Nama, Subjek, Isi Pesan (diisi di form web) |
| Mekanisme | User mengisi form di halaman `/contact`, lalu klik tombol "Kirim via WhatsApp". Aplikasi membuka link `https://wa.me/{ADMIN_PHONE}?text={encoded_message}` di tab baru. Pesan otomatis terformat dari input form |
| Output | Redirect ke WhatsApp Web/App dengan pesan yang sudah terisi |
| Akses | Public (tanpa login) |
| Catatan | Tidak menyimpan data ke database. Nomor WA admin dikonfigurasi via environment variable `ADMIN_WHATSAPP_NUMBER` |

### 4.6 Pencarian Buku

| Item | Detail |
|---|---|
| Deskripsi | User mencari buku berdasarkan kata kunci |
| Input | Kata kunci (judul, penulis) |
| Fitur | Search bar dengan filter kategori |
| Output | Daftar buku yang sesuai |

### 4.7 Detail Buku

| Item | Detail |
|---|---|
| Deskripsi | Menampilkan informasi lengkap sebuah buku |
| Konten | Judul, penulis, penerbit, tahun terbit, harga, deskripsi, gambar cover, kategori, stok |
| Aksi | Tombol "Add to Cart" |

### 4.8 Add to Cart (Keranjang Belanja)

| Item | Detail |
|---|---|
| Deskripsi | User menambahkan buku ke dalam keranjang belanja |
| Fitur | Tambah item, ubah jumlah, hapus item, lihat subtotal |
| Validasi | Stok tersedia, user harus login |
| Penyimpanan | Server-side (database) agar persisten |

### 4.9 Checkout & Payment

| Item | Detail |
|---|---|
| Deskripsi | Proses pemesanan dan pembayaran buku |
| Akses | User harus login |

#### Metode Pembayaran

| Metode | Deskripsi |
|---|---|
| **COD (Cash on Delivery)** | Pembayaran tunai saat buku diterima. Status pesanan: *Menunggu Pengiriman* |
| **Transfer Bank (Upload Bukti)** | User transfer manual ke rekening toko, lalu upload foto bukti transfer. Admin verifikasi manual. Status: *Menunggu Verifikasi* → *Diproses* |
| **Midtrans Payment Gateway** | Pembayaran online otomatis via Midtrans Snap (GoPay, OVO, VA, kartu kredit, dll). Status otomatis update via callback/webhook |

#### Alur Checkout

```
Keranjang → Isi Alamat Pengiriman → Pilih Metode Pembayaran → Konfirmasi Pesanan
  ├─ COD           → Pesanan dibuat (status: Menunggu Pengiriman)
  ├─ Transfer Bank → Pesanan dibuat (status: Menunggu Pembayaran)
  │                  → User upload bukti → Admin verifikasi → Diproses
  └─ Midtrans      → Redirect ke Snap → Pembayaran → Webhook update status → Diproses
```

### 4.10 Riwayat Pesanan

| Item | Detail |
|---|---|
| Deskripsi | User melihat daftar pesanan yang pernah dibuat |
| Konten | Kode pesanan, tanggal, status, total, detail item, nomor resi |
| Aksi | Upload bukti transfer (jika metode transfer), lihat detail, lacak pengiriman |

---

## 5. Fitur — Admin

### 5.1 Dashboard Admin

| Item | Detail |
|---|---|
| Deskripsi | Halaman utama admin menampilkan ringkasan sistem |
| Konten | Total buku, total user, total pesanan, pesanan terbaru, pendapatan |

### 5.2 CRUD Kategori Buku

| Item | Detail |
|---|---|
| Deskripsi | Mengelola kategori buku |
| Aksi | Tambah, Edit, Hapus kategori |
| Field | Nama kategori, slug |
| Validasi | Nama unik, tidak boleh kosong |

### 5.3 CRUD Data Buku

| Item | Detail |
|---|---|
| Deskripsi | Mengelola data buku |
| Aksi | Tambah, Edit, Hapus buku |
| Field | Judul, Penulis, Penerbit, Tahun Terbit, Harga, Stok, Deskripsi, Gambar Cover, Kategori |
| Validasi | Field wajib terisi, harga > 0, stok >= 0 |

### 5.4 Daftar User

| Item | Detail |
|---|---|
| Deskripsi | Melihat daftar user yang telah terdaftar |
| Konten | Nama, Email, No. Telepon, Alamat, Tanggal registrasi |
| Fitur | Pencarian user |

### 5.5 Daftar Pesanan

| Item | Detail |
|---|---|
| Deskripsi | Melihat dan mengelola data pesanan dari semua user |
| Konten | Nomor pesanan, nama user, tanggal, metode pembayaran, status, total |
| Aksi | Lihat detail pesanan, update status pesanan, verifikasi bukti transfer, input nomor resi |

#### Status Pesanan

| Status | Keterangan |
|---|---|
| Menunggu Pembayaran | Pesanan dibuat, belum bayar (transfer bank) |
| Menunggu Verifikasi | Bukti transfer sudah diupload, menunggu admin cek |
| Menunggu Pengiriman | Pembayaran dikonfirmasi / COD |
| Dikirim | Pesanan sedang dikirim |
| Selesai | Pesanan diterima |
| Dibatalkan | Pesanan dibatalkan |

---

## 6. Data Model

### Users

| Field | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| name | VARCHAR(55) | Nama lengkap |
| email | VARCHAR(45) | Unique |
| address | TEXT | Alamat lengkap |
| phone | VARCHAR(15) | Nomor telepon |
| password | VARCHAR(255) | Hashed (bcrypt) |
| role | ENUM('admin','user') | Default: 'user' |
| created_at | TIMESTAMP | Tanggal registrasi |
| updated_at | TIMESTAMP | |

### Categories

| Field | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| name | VARCHAR(55) | Nama kategori (unique) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Books

| Field | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| category_id | Int (FK) | Relasi ke Categories |
| title | VARCHAR(100) | Judul buku |
| author | VARCHAR(60) | Penulis |
| publisher | VARCHAR(60) | Penerbit |
| year | VARCHAR(10) | Tahun terbit |
| price | Int | Harga (Rp) |
| stock | Int | Jumlah stok |
| description | TEXT | Deskripsi buku |
| image | VARCHAR(100) | Path/URL gambar cover |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Orders

| Field | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| user_id | Int (FK) | Relasi ke Users |
| order_code | VARCHAR(25) | Kode pesanan (unique, auto-generate, contoh: `ORD-20260406-0001`) |
| total_payment | Int | Total pembayaran (Rp) |
| status | VARCHAR(25) | Status pesanan (lihat daftar status) |
| payment_method | VARCHAR(25) | COD / TRANSFER / MIDTRANS |
| payment_proof | VARCHAR(100) | Path/URL bukti transfer (nullable) |
| midtrans_order_id | VARCHAR(50) | Order ID Midtrans (nullable) |
| resi | VARCHAR(30) | Nomor resi pengiriman (nullable, diisi admin) |
| shipping_address | TEXT | Alamat pengiriman (snapshot dari alamat user saat checkout) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Order Details

| Field | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| order_id | Int (FK) | Relasi ke Orders |
| book_id | Int (FK) | Relasi ke Books |
| quantity | Int | Jumlah |
| price | Int | Harga satuan saat checkout |
| subtotal | Int | quantity × price |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Carts

| Field | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| user_id | Int (FK) | Relasi ke Users |
| book_id | Int (FK) | Relasi ke Books |
| quantity | Int | Jumlah |
| total_price | Int | quantity × harga buku |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Relasi Antar Tabel

```
Users (1) ──── (N) Orders
Users (1) ──── (N) Carts
Categories (1) ──── (N) Books
Books (1) ──── (N) Carts
Books (1) ──── (N) Order Details
Orders (1) ──── (N) Order Details
```

---

## 7. Halaman & Routing

### Public Pages

| Route | Halaman |
|---|---|
| `/` | Home — daftar buku, hero section |
| `/about` | About Us |
| `/contact` | Contact admin via WhatsApp redirect |
| `/books` | Daftar semua buku + pencarian + filter |
| `/books/[id]` | Detail buku |
| `/login` | Login user |
| `/register` | Registrasi user |

### User Pages (Protected)

| Route | Halaman |
|---|---|
| `/cart` | Keranjang belanja |
| `/checkout` | Proses checkout |
| `/orders` | Riwayat pesanan |
| `/orders/[id]` | Detail pesanan + upload bukti transfer |

### Admin Pages (Protected — role: ADMIN)

| Route | Halaman |
|---|---|
| `/admin` | Dashboard admin |
| `/admin/categories` | CRUD Kategori buku |
| `/admin/books` | CRUD Data buku |
| `/admin/users` | Daftar user |
| `/admin/orders` | Daftar pesanan + verifikasi |

---

## 8. API Routes

### Auth

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/[...nextauth]` | NextAuth handler (login/logout/session) |

### Books

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/books` | Daftar buku (+ search, filter, pagination) |
| GET | `/api/books/[id]` | Detail buku |
| POST | `/api/admin/books` | Tambah buku (admin) |
| PUT | `/api/admin/books/[id]` | Edit buku (admin) |
| DELETE | `/api/admin/books/[id]` | Hapus buku (admin) |

### Categories

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/categories` | Daftar kategori |
| POST | `/api/admin/categories` | Tambah kategori (admin) |
| PUT | `/api/admin/categories/[id]` | Edit kategori (admin) |
| DELETE | `/api/admin/categories/[id]` | Hapus kategori (admin) |

### Cart

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/cart` | Ambil isi keranjang user |
| POST | `/api/cart` | Tambah item ke keranjang |
| PUT | `/api/cart/[id]` | Update jumlah item |
| DELETE | `/api/cart/[id]` | Hapus item dari keranjang |

### Orders

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/orders` | Buat pesanan baru (checkout) |
| GET | `/api/orders` | Riwayat pesanan user |
| GET | `/api/orders/[id]` | Detail pesanan |
| POST | `/api/orders/[id]/upload-proof` | Upload bukti transfer |
| GET | `/api/admin/orders` | Semua pesanan (admin) |
| PUT | `/api/admin/orders/[id]/status` | Update status pesanan (admin) |

### Payment

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/payment/midtrans` | Buat transaksi Midtrans Snap |
| POST | `/api/payment/midtrans/callback` | Webhook notification dari Midtrans |

### Users (Admin)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/admin/users` | Daftar user (admin) |

### Contact

Tidak ada API endpoint — halaman contact menggunakan **WhatsApp redirect** (`wa.me` link) yang di-generate di client-side.

---

## 9. Integrasi Midtrans

### Flow

1. User checkout dengan metode Midtrans
2. Backend membuat transaksi via **Midtrans Snap API** → dapat `snap_token`
3. Frontend menampilkan **Snap payment popup**
4. User menyelesaikan pembayaran
5. Midtrans mengirim **webhook notification** ke `/api/payment/midtrans/callback`
6. Backend memverifikasi signature & update status pesanan

### Konfigurasi

| Item | Keterangan |
|---|---|
| Mode | Sandbox (development) / Production |
| Endpoint | `https://app.sandbox.midtrans.com/snap/v1/transactions` |
| Auth | Server Key (Basic Auth) |
| Webhook | Verify signature key dari notification |

### Environment Variables

```env
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
ADMIN_WHATSAPP_NUMBER=62812xxxxxxxx
```

---

## 10. Keamanan

- Password di-hash menggunakan **bcrypt**
- Session management via **NextAuth.js** (JWT / database session)
- API admin dilindungi middleware pengecekan role
- Input validation di setiap endpoint (menggunakan **Zod**)
- Proteksi CSRF bawaan NextAuth
- Midtrans webhook diverifikasi dengan **signature key**
- Upload file divalidasi (tipe & ukuran)

---

## 11. Struktur Folder

```
USK-BookStore/
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (public)/           # Layout publik
│   │   │   ├── page.tsx        # Home
│   │   │   ├── about/
│   │   │   ├── contact/         # WhatsApp redirect form
│   │   │   ├── books/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (user)/             # Layout user (protected)
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── orders/
│   │   │       └── [id]/
│   │   ├── admin/              # Layout admin (protected)
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── categories/
│   │   │   ├── books/
│   │   │   ├── users/
│   │   │   └── orders/
│   │   └── api/
│   │       ├── auth/
│   │       ├── books/
│   │       ├── categories/
│   │       ├── cart/
│   │       ├── orders/
│   │       ├── payment/
│   │       └── admin/
│   ├── components/
│   │   ├── ui/                 # Komponen UI reusable
│   │   ├── layout/             # Navbar, Footer, Sidebar
│   │   └── forms/              # Form components
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client
│   │   ├── auth.ts             # NextAuth config
│   │   ├── midtrans.ts         # Midtrans helper
│   │   └── utils.ts            # Utility functions
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── middleware.ts            # Route protection
├── .env
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 12. Business Logic & Validation Rules

Bagian ini mendefinisikan **seluruh aturan bisnis** yang harus diimplementasikan untuk mencegah logic error.

---

### 12.1 Auth & User

| # | Rule | Detail |
|---|---|---|
| A1 | Email unik | Registrasi gagal jika email sudah terdaftar. Tampilkan pesan "Email sudah terdaftar" |
| A2 | Password hashing | Password **tidak boleh** disimpan plain text. Selalu hash dengan bcrypt sebelum simpan |
| A3 | Konfirmasi password | Field konfirmasi password harus identik dengan password. Validasi di client **dan** server |
| A4 | Login gagal | Tidak boleh membedakan pesan error "email tidak ditemukan" vs "password salah" — gunakan pesan generik "Email atau password salah" (mencegah user enumeration) |
| A5 | Session expired | Redirect ke `/login` jika session expired saat akses halaman protected |
| A6 | Role guard | User dengan role `user` tidak bisa akses `/admin/*`. User dengan role `admin` tidak bisa melakukan checkout/order (admin bukan pembeli) |
| A7 | Login redirect | Jika user sudah login, akses ke `/login` dan `/register` harus redirect ke Home |

---

### 12.2 Buku & Kategori

| # | Rule | Detail |
|---|---|---|
| B1 | Kategori tidak bisa dihapus jika masih punya buku | Jika kategori masih memiliki relasi ke buku, tampilkan error "Kategori tidak bisa dihapus karena masih memiliki X buku". Admin harus pindahkan/hapus buku terlebih dahulu |
| B2 | Buku tidak bisa dihapus jika ada di pesanan aktif | Jika buku ada di `order_details` dengan status pesanan belum `Selesai` atau `Dibatalkan`, tolak penghapusan. Alternatif: soft-delete (set stok = 0, sembunyikan dari katalog) |
| B3 | Harga harus > 0 | Validasi server-side, harga tidak boleh 0 atau negatif |
| B4 | Stok harus >= 0 | Stok buku tidak boleh negatif di database (level constraint) |
| B5 | Nama kategori unik | Tidak boleh ada 2 kategori dengan nama sama (case-insensitive) |
| B6 | Gambar wajib | Buku harus memiliki gambar cover. Validasi saat create. Saat edit, gambar lama dipertahankan jika tidak diubah |
| B7 | Tahun valid | Tahun terbit harus angka valid, tidak boleh di masa depan |

---

### 12.3 Keranjang (Cart)

| # | Rule | Detail |
|---|---|---|
| C1 | **Quantity ≤ stok tersedia** | Saat tambah/update quantity di cart, jumlah **tidak boleh melebihi** `books.stock`. Jika user set qty = 5 tapi stok hanya 3, tolak dan tampilkan "Stok tersedia hanya 3" |
| C2 | Quantity minimal 1 | Jika quantity diubah ke 0, item otomatis dihapus dari cart. Quantity tidak boleh negatif |
| C3 | Buku duplikat di cart | Jika user menambah buku yang **sudah ada** di cart, quantity di-increment (bukan buat row baru). Total quantity setelah increment tetap harus ≤ stok |
| C4 | Buku stok habis | Buku dengan `stock = 0` : tombol "Add to Cart" disabled, tampilkan label "Stok Habis" |
| C5 | Stok berkurang setelah checkout | Jika stok buku berkurang (dibeli user lain) dan **cart quantity > stok terbaru**, tampilkan warning di halaman cart: "Stok [Judul Buku] berubah, tersisa X" dan auto-adjust quantity ke stok yang tersedia |
| C6 | Buku dihapus admin | Jika buku di cart sudah dihapus oleh admin, item otomatis dihilangkan dari cart saat user buka halaman cart. Tampilkan notifikasi "Beberapa item dihapus karena sudah tidak tersedia" |
| C7 | Harus login | Akses cart tanpa login → redirect ke `/login` |
| C8 | `total_price` selalu dihitung ulang | `total_price` di cart = `quantity × books.price` (harga terkini). Selalu hitung ulang saat tampilkan cart, bukan ambil dari field statis |
| C9 | Cart kosong | Tidak bisa checkout jika cart kosong. Tombol checkout disabled, tampilkan "Keranjang kosong" |

---

### 12.4 Checkout & Order

| # | Rule | Detail |
|---|---|---|
| D1 | **Validasi stok final saat checkout** | Saat user klik "Konfirmasi Pesanan", **re-check stok semua item** di cart. Jika ada item yang stoknya tidak cukup, **batalkan seluruh checkout**, tampilkan item mana yang bermasalah. User harus perbaiki cart dulu |
| D2 | **Stok dikurangi saat order dibuat** | Segera setelah order berhasil dibuat, kurangi `books.stock` sesuai quantity yang dipesan. Gunakan **database transaction** untuk atomicity |
| D3 | Race condition prevention | Gunakan `SELECT ... FOR UPDATE` (atau Prisma transaction dengan isolation level) saat cek stok + kurangi stok, agar 2 user tidak membeli stok yang sama |
| D4 | Alamat pengiriman wajib | Checkout gagal jika alamat pengiriman kosong |
| D5 | Harga di-snapshot | `order_details.price` = harga buku **saat checkout**, bukan referensi ke `books.price`. Jika admin ubah harga buku setelahnya, pesanan lama tidak terpengaruh |
| D6 | `subtotal` dihitung server | `order_details.subtotal = quantity × price`. Dihitung di server, tidak percaya input dari client |
| D7 | `total_payment` dihitung server | `orders.total_payment = SUM(order_details.subtotal)`. Dihitung di server dari seluruh order_details |
| D8 | Cart dikosongkan setelah order | Setelah order berhasil dibuat, hapus semua item di cart user tersebut. Dalam 1 transaction bersama pembuatan order |
| D9 | Order code unik | Auto-generate format `ORD-{YYYYMMDD}-{increment}`. Gunakan mekanisme yang mencegah duplikasi (DB unique constraint) |
| D10 | User hanya lihat pesanannya | API `/api/orders` hanya return pesanan milik user yang sedang login. User A tidak bisa akses pesanan User B via URL `/orders/[id]` |

---

### 12.5 Pembayaran — COD

| # | Rule | Detail |
|---|---|---|
| E1 | Status awal | Order dibuat dengan status `Menunggu Pengiriman` |
| E2 | Tidak perlu upload bukti | Field `payment_proof` tetap null |

### 12.6 Pembayaran — Transfer Bank

| # | Rule | Detail |
|---|---|---|
| F1 | Status awal | Order dibuat dengan status `Menunggu Pembayaran` |
| F2 | Upload bukti wajib | User harus upload bukti transfer sebelum admin bisa verifikasi. Hanya bisa upload jika status = `Menunggu Pembayaran` |
| F3 | Validasi file upload | Hanya terima gambar (JPG, PNG, JPEG). File di-compress otomatis di client-side sebelum upload (target ≤ 1MB). Tolak file non-gambar |
| F4 | Re-upload | User bisa upload ulang bukti (replace) selama status masih `Menunggu Pembayaran` atau `Menunggu Verifikasi` |
| F5 | Setelah upload | Status berubah ke `Menunggu Verifikasi` |
| F6 | Admin verifikasi | Admin bisa "Terima" → status jadi `Menunggu Pengiriman`, atau "Tolak" → status kembali ke `Menunggu Pembayaran` (user harus upload ulang) |
| F7 | Batas waktu | Jika user tidak upload bukti dalam 24 jam, pesanan otomatis dibatalkan dan **stok dikembalikan** |

### 12.7 Pembayaran — Midtrans

| # | Rule | Detail |
|---|---|---|
| G1 | Status awal | Order dibuat dengan status `Menunggu Pembayaran` + `midtrans_order_id` terisi |
| G2 | Snap token | Generate snap token hanya untuk order dengan `payment_method = MIDTRANS` dan `status = Menunggu Pembayaran` |
| G3 | Webhook | Hanya proses webhook dari Midtrans yang **signature-nya valid**. Reject semua request dengan signature tidak cocok |
| G4 | Idempotency | Webhook Midtrans bisa dikirim berkali-kali. Handler harus **idempotent** — jika status sudah `Menunggu Pengiriman`, jangan proses ulang |
| G5 | Status mapping | `settlement/capture` → `Menunggu Pengiriman`, `pending` → tetap `Menunggu Pembayaran`, `deny/cancel/expire` → `Dibatalkan` + **kembalikan stok** |
| G6 | Batas waktu Midtrans | Transaction expiry di-set via Midtrans (default 24 jam). Jika expire → status `Dibatalkan` + stok dikembalikan |

---

### 12.8 Status Pesanan — Transition Rules

Status hanya boleh berubah sesuai alur berikut. **Transisi di luar ini harus ditolak.**

```
                           ┌─────────────────────────────┐
                           │                             │
Menunggu Pembayaran ──→ Menunggu Verifikasi ──→ Menunggu Pengiriman ──→ Dikirim ──→ Selesai
       │                        │                       │                  │
       │                        │                       │                  │
       └──→ Dibatalkan ←────────┘               Dibatalkan ←───────────────┘
                 ↑
                 │
           (auto: timeout/expire)
```

| Dari | Ke | Siapa | Kondisi |
|---|---|---|---|
| Menunggu Pembayaran | Menunggu Verifikasi | User | Upload bukti transfer |
| Menunggu Pembayaran | Dibatalkan | System/User | Timeout 24 jam, atau user batalkan manual |
| Menunggu Verifikasi | Menunggu Pengiriman | Admin | Verifikasi bukti diterima |
| Menunggu Verifikasi | Menunggu Pembayaran | Admin | Bukti ditolak |
| Menunggu Pengiriman | Dikirim | Admin | Input nomor resi |
| Menunggu Pengiriman | Dibatalkan | Admin | Alasan tertentu |
| Dikirim | Selesai | Admin/User | Konfirmasi pesanan diterima |
| Dikirim | Dibatalkan | Admin | Kasus khusus (retur) |

**Catatan penting:**
- Setiap transisi ke `Dibatalkan` → **stok dikembalikan** ke `books.stock`
- Stok dikembalikan = `SUM(order_details.quantity)` per buku
- `Selesai` dan `Dibatalkan` adalah **status final**, tidak bisa diubah lagi

---

### 12.9 Stok — Ringkasan Lifecycle

```
[Buku dibuat]     → stock = N (set admin)
[User checkout]   → stock -= quantity (dalam transaction)
[Order dibatalkan] → stock += quantity (kembalikan)
[Admin edit stok]  → stock = value baru (manual override)
```

| Event | Aksi pada Stok |
|---|---|
| Order dibuat (checkout) | `stock -= quantity` |
| Order dibatalkan (manual/user) | `stock += quantity` |
| Midtrans expire/deny/cancel | `stock += quantity` |
| Transfer timeout 24 jam | `stock += quantity` |
| Admin tolak bukti transfer | Stok **tidak** berubah (order masih aktif, user masih bisa upload ulang) |
| Admin edit buku | Stok berubah sesuai input admin |

---

### 12.10 Upload File & Compression

| # | Rule | Detail |
|---|---|---|
| H1 | Tipe file | Hanya JPG, JPEG, PNG untuk bukti transfer. Untuk cover buku: JPG, JPEG, PNG, WEBP |
| H2 | Client-side compression | Semua gambar yang diupload **di-compress otomatis di browser** sebelum dikirim ke server. Gunakan library seperti `browser-image-compression`. Target: ≤ 1MB, max width 1920px, kualitas 0.7-0.8 |
| H3 | Max size setelah compress | Jika setelah compress masih > 2MB, tampilkan error "Gambar terlalu besar, gunakan gambar yang lebih kecil". Ini sebagai safety net |
| H4 | Validasi server | Validasi MIME type di server, jangan hanya percaya extension file. Max upload limit di server = 5MB (safety net) |
| H5 | Nama file | Rename file dengan UUID/unique name untuk mencegah collision dan path traversal |
| H6 | Hapus file lama | Saat re-upload bukti transfer atau ganti cover buku, hapus file lama dari storage |
| H7 | Storage | Simpan di `public/uploads/books/` dan `public/uploads/proofs/`. Untuk production, bisa migrasi ke cloud storage |

---

### 12.11 Admin — Edge Cases

| # | Rule | Detail |
|---|---|---|
| I1 | Resi wajib saat kirim | Status tidak bisa diubah ke `Dikirim` jika nomor resi belum diisi |
| I2 | Admin tidak bisa hapus dirinya | Admin tidak bisa menghapus akun admin sendiri |
| I3 | Dashboard hitung hanya pesanan Selesai | Pendapatan di dashboard dihitung dari pesanan dengan status `Selesai` saja |
| I4 | Pagination | Semua daftar (buku, user, pesanan) harus ada pagination. Jangan load semua data sekaligus |

---

### 12.12 Concurrency & Data Integrity

| # | Rule | Detail |
|---|---|---|
| J1 | Database transaction | Checkout (cek stok + buat order + buat order_details + kurangi stok + kosongkan cart) harus dalam **1 transaction**. Jika 1 step gagal, rollback semua |
| J2 | Pembatalan + stok | Pembatalan order + pengembalian stok juga dalam **1 transaction** |
| J3 | Optimistic UI | Frontend boleh update UI optimistically, tapi **selalu validasi di server** |
| J4 | Price integrity | Jangan pernah ambil harga dari frontend/client. Selalu baca `books.price` dari database saat kalkulasi |

---

## 13. Panduan Kode (Sesuai Persyaratan USK)

Sesuai unit kompetensi J.620100.016.01 dan J.620100.015.01:

- **Komentar deskripsi** wajib ada di setiap fungsi/modul
- **Kode terstruktur** — pemisahan concern (komponen, API, lib, types)
- **Naming convention** konsisten — camelCase untuk variabel, PascalCase untuk komponen
- **Best practices** — gunakan TypeScript strict mode, error handling yang tepat
- **Library pre-existing** — memanfaatkan Next.js, Prisma, NextAuth, Midtrans SDK, Tailwind CSS
- Gambar/video dari internet harus **bebas hak cipta** (Unsplash, Pexels, dll.)
