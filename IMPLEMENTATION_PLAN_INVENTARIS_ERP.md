# IMPLEMENTATION PLAN: Sistem Inventaris Cerdas & Akuntansi ERP-Lite BukuCerdas

Dokumen ini berisi panduan tahap demi tahap (Phase-by-Phase) beserta **prompt spesifik** yang bisa Anda *copy-paste* langsung ke AI Agent (seperti saya) untuk mengeksekusi pembangunan fitur secara bertahap tanpa merusak *business logic* yang ada.

Setiap fase dirancang untuk mandiri sehingga AI dapat fokus pada satu konteks sebelum lanjut ke tahap berikutnya.

---

## 📌 Phase 1: Pembaruan Prisma Schema & Seeder
**Tujuan:** Memperbarui struktur database untuk mendukung HPP (Harga Pokok Penjualan), Riwayat Stok, dan Kategori Pengeluaran.

### Prompt untuk AI:
```text
Tugas: Eksekusi Phase 1 - Perubahan Prisma Schema untuk Sistem Inventaris.

1. Buka file `prisma/schema.prisma`.
2. Pada model `Buku`:
   - Tambahkan `hargaBeli Decimal @default(0) @db.Decimal(10, 2) @map("harga_beli")`
   - Tambahkan `persentaseUntung Decimal? @map("persentase_untung") @db.Decimal(5, 2)`
   - Tetapkan `harga` sebagai harga jual final.
3. Pada model `DetailPesanan`:
   - Tambahkan `hargaBeliSatuan Decimal @default(0) @map("harga_beli_satuan") @db.Decimal(10, 2)`
4. Buat Enum baru: `enum JenisRiwayatStok { masuk keluar penyesuaian }` dan `enum KategoriPengeluaran { operasional pembelian_stok }`.
5. Buat model baru `RiwayatStok`:
   - idRiwayat, idBuku, jenis (JenisRiwayatStok), jumlah (Int), hargaBeliSatuan (Decimal), keterangan (String?), tanggal (DateTime default now). Relasi ke `Buku`.
6. Pada model `Pengeluaran`:
   - Tambahkan `kategori KategoriPengeluaran @default(operasional)`
7. Buka `prisma/seed.ts`, update mock data Buku agar memiliki `hargaBeli` (misal 70% dari harga jual saat ini). Dan update mock data `Pengeluaran` agar memiliki kategori `operasional`.
8. Jika sudah, beritahu saya agar saya bisa menjalankan `npx prisma format` dan `npx prisma migrate dev`.
```

---

## 📌 Phase 2: Pembaruan Flow Checkout (Business Logic Integrity)
**Tujuan:** Memastikan setiap kali user membuat pesanan, `hargaBeliSatuan` tercatat dengan benar, dan `RiwayatStok` (Keluar) otomatis terbuat.

### Prompt untuk AI:
```text
Tugas: Eksekusi Phase 2 - Pembaruan API Checkout untuk Integritas Laba/Rugi.

1. Buka folder `app/api/checkout` (terutama `route.ts`).
2. Saat logic membuat `DetailPesanan` dalam *Prisma Transaction*:
   - Pastikan ketika nge-query keranjang/buku, Anda *include/select* `hargaBeli` dari model `Buku`.
   - Petakan `hargaBeli` tersebut ke field `hargaBeliSatuan` saat `prisma.pesanan.create` di bagian `detailPesanan: { create: [...] }`.
3. Tambahkan logic pencatatan `RiwayatStok`:
   - Di dalam transaksi yang sama (atau setelahnya jika aman), buat insert ke `prisma.riwayatStok.createMany` atau loop `create`.
   - `idBuku` sesuai item.
   - `jenis`: `keluar`
   - `jumlah`: sesuai quantity yang dibeli.
   - `hargaBeliSatuan`: sesuai hargaBeli buku saat ini.
   - `keterangan`: "Pesanan #[KodePesanan]"
4. Pastikan tidak ada flow UI/UX user yang rusak saat melakukan checkout. Kembalikan error yang ramah (dalam bahasa Indonesia) jika terjadi kegagalan transaksi inventaris.
```

---

## 📌 Phase 3: Pembuatan Endpoint Prediksi & Restock
**Tujuan:** Membuat API pendukung untuk Halaman Inventaris.

### Prompt untuk AI:
```text
Tugas: Eksekusi Phase 3 - API Inventaris Cerdas & Restock.

1. Buat direktori dan file API baru: `app/api/admin/inventaris/prediksi/route.ts`.
   - Logic: Ambil seluruh `Buku` beserta data transaksinya (`DetailPesanan` dengan pesanan yang statusnya SUCCESS/Selesai) dalam 30 hari terakhir.
   - Hitung Kecepatan Penjualan Harian (Terjual / 30).
   - Hitung Reorder Point (ROP) = (Kecepatan * 7 hari) + Safety Stock (misal Kecepatan * 3).
   - Hitung Status: "Dead Stock" (stok>0 tapi terjual 0), "Habis" (stok=0), "Low Stock" (stok <= ROP), "Aman".
   - Kembalikan response JSON berisi array buku beserta perhitungan algoritma dan `rekomendasiRestock`.
2. Buat API `app/api/admin/inventaris/[id]/restock/route.ts` (POST).
   - Payload: `jumlah`, `hargaBeliSaatIni`.
   - Gunakan `$transaction`:
     a. Update stok di model `Buku`: `stok: { increment: jumlah }`, update `hargaBeli` jika berubah.
     b. Buat `RiwayatStok` jenis "masuk".
     c. Buat `Pengeluaran` dengan kategori "pembelian_stok", `nominal` = jumlah * hargaBeli, `judul` = "Restock Buku [Judul] x[Jumlah]".
3. Utamakan type-safety TypeScript dan penanganan error yang baik.
```

---

## 📌 Phase 4: UI Admin - Sidebar & Pengeluaran Page
**Tujuan:** Merapikan navigasi Admin dan membuat CRUD pengeluaran.

### Prompt untuk AI:
```text
Tugas: Eksekusi Phase 4 - Restrukturisasi Navigasi UI & Page Pengeluaran.

1. Buka `app/admin/_components/Sidebar.tsx`.
   - Rombak susunan menu dengan kelompok (Gunakan teks kecil abu-abu sebagai header grup, misal "MASTER DATA", "TRANSAKSI", "OPERASIONAL", "ANALITIK").
   - Tambahkan menu `Inventaris` (`/admin/inventaris`) bersimbol kotak/Package, dan `Pengeluaran` (`/admin/pengeluaran`) bersimbol uang/Receipt, letakkan di grup OPERASIONAL.
2. Buat halaman `app/admin/pengeluaran/page.tsx` & komponen kelengkapannya.
   - Buat fungsi list pengeluaran dengan filter kategori (Semua / Operasional / Pembelian Stok).
   - Buat Modal Tambah Pengeluaran (hanya bisa tambah kategori `operasional`, karena `pembelian_stok` otomatis dari sistem backend).
   - Buat fungsionalitas Hapus pengeluaran (cek agar `pembelian_stok` tidak bisa sembarangan dihapus/diedit bila ingin menjaga integritas, atau beri warning khusus).
3. Gunakan *framer-motion* untuk transisi, *Tailwind CSS* untuk keindahan UI modern (Card, Table dengan border tipis, Badges).
```

---

## 📌 Phase 5: UI Admin - Halaman Inventaris Cerdas
**Tujuan:** Membuat antarmuka visual prediksi stok & restock.

### Prompt untuk AI:
```text
Tugas: Eksekusi Phase 5 - Halaman Inventaris Cerdas.

1. Buat halaman utama `app/admin/inventaris/page.tsx`.
   - Fetch data dari `/api/admin/inventaris/prediksi` via Client Component (atau SSR dengan refresh).
   - Tampilkan tabel *Inventory*: Cover, Judul, Stok Aktual, Kecepatan Penjualan, Status UX Badge (Hijau "Aman", Kuning/Merah "Low Stock", Abu-abu "Dead Stock").
2. Integrasikan Aksi "Restock Buku" (Buka Modal).
   - Modal menampilkan field "Jumlah Restock" dan "Harga Modal / Buku". 
   - Jika status = "Low Stock", munculkan teks kecil *"Sistem menyarankan restock sejumlah X buku"* dan sediakan tombol `Isi Otomatis Rekomendasi`.
   - Saat submit, tembak endpoint `/api/admin/inventaris/[id]/restock`. Tampilkan toast / alert Sukses.
3. Integrasikan Aksi "Kartu Stok" (Buka Modal).
   - Tampilkan list timeline/tabel mini (fetch dari `Buku.riwayatStok`) urut tanggal desc.
4. Buat UX semenarik dan semudah mungkin dengan indikator loading state.
```

---

## 📌 Phase 6: UI Admin - Pembersihan Buku Form & Update Laporan
**Tujuan:** Limitasi field buku dan update pelaporan *Profit/Loss* (ERP-Lite).

### Prompt untuk AI:
```text
Tugas: Eksekusi Phase 6 - Pembersihan Flow Buku, Laporan Laba/Rugi, & Dashboard.

1. Buka Halaman Form Tambah/Edit Buku di `app/admin/buku/...`.
   - Hapus input `Stok` secara langsung (stok awal biarkan 0 default, admin penuhi di Inventaris).
   - Tambahkan input `Harga Modal (Beli)` dan checkbox/toggle "Gunakan Mark-up Persentase".
   - Jika Toggle ON, tampilkan input "% Keuntungan" dan otomatis block (disable) input `Harga Jual`, hitung otomatis dengan js `hargaBeli + (hargaBeli * persen / 100)`. Saat submit, kirim nilai fix harga jual ke backend.
2. Buka `app/api/admin/laporan/route.ts`.
   - Update penghitungan Laba/Rugi.
   - Pemasukan Bersih = Sum dari `DetailPesanan.subtotal` pada pesanan sukses (Ongkir di-exclude total dari Pemasukan Bisnis).
   - HPP Total = Sum dari (`DetailPesanan.hargaBeliSatuan` * `jumlah`) pada pesanan sukses.
   - Laba Kotor = Pemasukan Bersih - HPP Total.
   - Pengeluaran Operasional = Sum dari tabel `Pengeluaran` kategori operasional.
   - Laba Bersih = Laba Kotor - Pengeluaran Operasional.
3. Update `app/admin/dashboard/page.tsx`.
   - Tambahkan Widget Kecil "Peringatan Stok!" yang nge-fetch dari API prediksi, tampilkan maksimal 5 buku yg berstatus "Low Stock" atau "Habis", beri tautan ke halaman Inventaris.
```
