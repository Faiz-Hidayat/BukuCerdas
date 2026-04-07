# Development Plan — BukuCerdas Upgrade

**Tanggal:** 7 April 2026
**Referensi:** `GAP_ANALYSIS.md`, `PRD.md`
**Status Awal:** ~55% complete — semua halaman ada, perlu perbaikan keamanan, business logic, dan fitur

> **Dokumen ini berisi prompt per phase yang bisa langsung dijalankan oleh AI Agent.**
> Setiap phase fokus pada area spesifik. Prompt bersifat **inkremental** — memperbaiki kode yang sudah ada, bukan menulis ulang.

---

## Aturan Umum

- Selalu baca `PRD.md` dan `GAP_ANALYSIS.md` sebelum memulai phase apapun
- Baca `copilot-instructions.md` untuk konvensi penamaan (Bahasa Indonesia)
- **JANGAN** mengubah arsitektur yang sudah ada (custom JWT tetap dipakai, route naming Indonesia tetap)
- Setiap perubahan API harus **backward-compatible** dengan UI yang sudah ada
- Setiap fungsi/modul **wajib ada komentar deskripsi** (persyaratan USK)
- Gunakan pattern yang sudah ada di codebase (prisma client dari `@/lib/prisma`, auth dari `@/lib/auth`)
- Jangan menambah library baru kecuali disebutkan secara eksplisit dalam phase

---

## Phase 1: Keamanan — Admin Auth Guard 🔴

**Prioritas:** KRITIS
**PRD Rules:** A6 (Role guard), 10 (Keamanan)
**Estimasi file yang diubah:** ~12 file API route

### Prompt:

```
Baca PRD.md Section 10 (Keamanan) dan Section 12.1 rule A6.
Baca GAP_ANALYSIS.md Section 4.1 (Admin API Tanpa Auth Guard).

MASALAH: Hampir semua endpoint `/api/admin/*` TIDAK memiliki pengecekan role.
User biasa bisa mengakses CRUD buku, hapus user, ubah pesanan, dll.
Hanya `/api/admin/notifikasi` dan `/api/admin/search` yang sudah punya guard.

TUGAS:

1. **Buat helper `requireAdmin()` di `lib/auth.ts`:**
   ```ts
   /**
    * Mengecek apakah user saat ini adalah admin.
    * Throw error atau return null jika bukan admin.
    * Digunakan di awal setiap API admin route.
    */
   export async function requireAdmin(): Promise<JwtPayload> {
     const user = await getCurrentUser();
     if (!user) throw new Error('UNAUTHORIZED');
     if (user.role !== 'admin') throw new Error('FORBIDDEN');
     return user;
   }
   ```

2. **Tambahkan auth guard ke SEMUA endpoint admin berikut:**
   - `app/api/admin/buku/route.ts` (GET, POST)
   - `app/api/admin/buku/[id]/route.ts` (GET, PUT, DELETE)
   - `app/api/admin/kategori-buku/route.ts` (GET, POST)
   - `app/api/admin/kategori-buku/[id]/route.ts` (PUT, DELETE)
   - `app/api/admin/user/route.ts` (GET, POST)
   - `app/api/admin/user/[id]/route.ts` (PUT, DELETE)
   - `app/api/admin/pesanan/route.ts` (GET)
   - `app/api/admin/pesanan/[id]/route.ts` (GET, PUT)
   - `app/api/admin/dashboard/route.ts` (GET)
   - `app/api/admin/laporan/route.ts` (GET)
   - `app/api/admin/pengaturan/route.ts` (GET, PUT)

   Pattern untuk setiap handler:
   ```ts
   try {
     const admin = await requireAdmin();
     // ... logika yang sudah ada
   } catch (error: any) {
     if (error.message === 'UNAUTHORIZED')
       return NextResponse.json({ error: 'Silakan login' }, { status: 401 });
     if (error.message === 'FORBIDDEN')
       return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
   ```

3. **Tambahkan rule A6 di checkout:** Pada `app/api/checkout/route.ts`,
   tambahkan pengecekan: jika `user.role === 'admin'`, tolak checkout
   dengan pesan "Admin tidak bisa melakukan pembelian".

4. **Buat endpoint publik untuk pengaturan toko:**
   Buat `app/api/pengaturan/route.ts` (GET only, tanpa auth) yang
   mengembalikan setting publik (pajak, metode pembayaran aktif).
   Ini diperlukan oleh halaman checkout yang diakses user biasa.
   Jangan expose informasi sensitif (nomor rekening detail).

### Acceptance Criteria:
- [ ] Semua `/api/admin/*` endpoints mengembalikan 401 jika tidak login
- [ ] Semua `/api/admin/*` endpoints mengembalikan 403 jika user biasa
- [ ] Admin tidak bisa checkout (403 di API)
- [ ] Halaman checkout masih bisa fetch pengaturan (endpoint publik baru)
- [ ] Endpoint `/api/admin/notifikasi` dan `/api/admin/search` tetap berfungsi
```

---

## Phase 2: Keamanan — Ownership Check & Input Validation 🔴

**Prioritas:** KRITIS
**PRD Rules:** C7, D10, H1, H4, B3-B7, 10 (Keamanan)
**Estimasi file yang diubah:** ~10 file

### Prompt:

```
Baca PRD.md Section 12.2 (B3-B7), 12.3 (C7), 12.4 (D10), 12.10 (H1-H7).
Baca GAP_ANALYSIS.md Section 4.2-4.5.

MASALAH:
- Cart PUT/DELETE tidak cek ownership (user bisa manipulasi cart orang lain)
- Checkout tidak cek alamat milik user
- Upload file tanpa validasi tipe & ukuran server-side
- Banyak API tanpa Zod validation

TUGAS:

1. **Cart ownership check — `app/api/keranjang/[id]/route.ts`:**
   Di PUT dan DELETE, setelah ambil item keranjang, verifikasi bahwa
   item tersebut milik keranjang user yang sedang login:
   ```ts
   // Cek bahwa item ini milik keranjang user yang login
   const keranjang = await prisma.keranjang.findUnique({
     where: { idUser: user.idUser }
   });
   if (!keranjang || item.idKeranjang !== keranjang.idKeranjang) {
     return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
   }
   ```

2. **Checkout address ownership — `app/api/checkout/route.ts`:**
   Setelah fetch alamat, cek `alamat.idUser === user.idUser`:
   ```ts
   if (alamat.idUser !== user.idUser) {
     return NextResponse.json({ error: 'Alamat tidak valid' }, { status: 400 });
   }
   ```

3. **Upload file validation — `lib/upload.ts`:**
   Tambahkan helper validasi file:
   ```ts
   /** Daftar MIME type yang diizinkan untuk upload gambar */
   const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
   const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB safety net

   /**
    * Validasi file upload: cek MIME type dan ukuran
    * Return pesan error atau null jika valid
    */
   export function validateUploadFile(file: File, options?: {
     allowedTypes?: string[];
     maxSize?: number;
   }): string | null { ... }
   ```
   Terapkan di:
   - `app/api/admin/buku/route.ts` (POST — cover upload)
   - `app/api/admin/buku/[id]/route.ts` (PUT — cover update)
   - `app/api/user/pesanan/[id]/upload-bukti/route.ts` (bukti transfer)
   - `app/api/user/profile/route.ts` (foto profil)
   - `app/api/admin/pengaturan/route.ts` (QRIS image)

4. **Zod validation schemas — buat `lib/validations/`:**
   - `lib/validations/buku.ts`:
     ```ts
     /** Schema validasi untuk membuat/edit buku */
     export const bukuSchema = z.object({
       judul: z.string().min(1, 'Judul wajib diisi').max(255),
       pengarang: z.string().min(1, 'Pengarang wajib diisi').max(255),
       penerbit: z.string().min(1, 'Penerbit wajib diisi').max(255),
       tahunTerbit: z.number().int().min(1900).max(new Date().getFullYear()), // B7
       harga: z.number().positive('Harga harus lebih dari 0'), // B3
       stok: z.number().int().nonnegative('Stok tidak boleh negatif'), // B4
       idKategori: z.number().int().positive(),
       sinopsis: z.string().optional(),
       isbn: z.string().max(20).optional(),
     });
     ```
   - `lib/validations/kategori.ts`:
     ```ts
     /** Schema validasi untuk kategori buku */
     export const kategoriSchema = z.object({
       namaKategori: z.string().min(1, 'Nama kategori wajib diisi').max(100),
       deskripsi: z.string().optional(),
     });
     ```
   - `lib/validations/checkout.ts`:
     ```ts
     /** Schema validasi untuk checkout */
     export const checkoutSchema = z.object({
       idAlamat: z.number().int().positive('Pilih alamat pengiriman'),
       metodePembayaran: z.enum(['cod', 'transfer_bank', 'ewallet', 'qris']),
     });
     ```
   - `lib/validations/pesanan.ts`:
     ```ts
     /** Schema validasi untuk update status pesanan oleh admin */
     export const updatePesananSchema = z.object({
       statusPembayaran: z.enum([...]).optional(),
       statusPesanan: z.enum([...]).optional(),
     });
     ```

5. **Terapkan Zod validation ke API routes:**
   - `app/api/admin/buku/route.ts` — POST: parse FormData lalu validasi
   - `app/api/admin/kategori-buku/route.ts` — POST: validasi namaKategori
   - `app/api/admin/kategori-buku/[id]/route.ts` — PUT: validasi
   - `app/api/checkout/route.ts` — validasi idAlamat & metodePembayaran
   - `app/api/kontak/route.ts` — validasi input form kontak

6. **B5 — Nama kategori unik (case-insensitive):**
   Di POST dan PUT kategori, cek:
   ```ts
   const existing = await prisma.kategoriBuku.findFirst({
     where: {
       namaKategori: { equals: namaKategori, mode: 'insensitive' },
       NOT: { idKategori: id } // exclude current saat edit
     }
   });
   if (existing) return NextResponse.json(
     { error: 'Nama kategori sudah digunakan' }, { status: 409 }
   );
   ```

7. **B2 — Cek pesanan aktif saat delete/deactivate buku:**
   Di DELETE `app/api/admin/buku/[id]/route.ts`, sebelum soft-delete, cek:
   ```ts
   const pesananAktif = await prisma.detailPesanan.count({
     where: {
       idBuku: id,
       pesanan: {
         statusPesanan: { notIn: ['selesai', 'dibatalkan'] }
       }
     }
   });
   if (pesananAktif > 0) {
     return NextResponse.json({
       error: `Buku tidak bisa dinonaktifkan karena ada ${pesananAktif} pesanan aktif`
     }, { status: 400 });
   }
   ```

### Acceptance Criteria:
- [ ] Cart PUT/DELETE hanya bisa untuk item milik user sendiri
- [ ] Checkout menolak alamat yang bukan milik user
- [ ] Upload file ditolak jika bukan gambar atau > 5MB
- [ ] Semua endpoint admin punya Zod validation
- [ ] Nama kategori duplikat ditolak (B5)
- [ ] Buku di pesanan aktif tidak bisa dihapus (B2)
- [ ] Harga <= 0 ditolak (B3), stok < 0 ditolak (B4)
- [ ] Tahun terbit di masa depan ditolak (B7)
```

---

## Phase 3: Database Schema Update 🔴

**Prioritas:** KRITIS
**PRD Rules:** PRD Section 6 (Data Model), G1, I1
**Estimasi file yang diubah:** schema.prisma + migration + ~3 API file

### Prompt:

```
Baca PRD.md Section 6 (Data Model), khusus tabel Orders.
Baca GAP_ANALYSIS.md Section 3.2, 3.3.

MASALAH:
- Model Pesanan tidak punya field `resi` (nomor resi pengiriman)
- Model Pesanan tidak punya field `midtransOrderId` (untuk integrasi Midtrans)
- Model Pesanan tidak snapshot alamat (hanya FK ke AlamatUser)
- Enum StatusPesanan tidak punya `menunggu_pembayaran` dan `menunggu_verifikasi`

TUGAS:

1. **Update `prisma/schema.prisma` — model Pesanan:**
   Tambahkan field-field berikut:
   ```prisma
   model Pesanan {
     // ... field yang sudah ada ...
     
     // Field baru
     resi               String?             @db.VarChar(50)
     midtransOrderId    String?             @unique @map("midtrans_order_id") @db.VarChar(100)
     alamatSnapshot     String?             @map("alamat_snapshot") @db.Text
     // alamatSnapshot berisi JSON string dari alamat saat checkout
     // agar data pesanan tidak berubah meskipun user edit alamat
   }
   ```

2. **Update enum `StatusPesanan`:**
   ```prisma
   enum StatusPesanan {
     menunggu_pembayaran     // Transfer/Midtrans: belum bayar
     menunggu_verifikasi     // Transfer: bukti sudah upload, admin belum cek
     menunggu_konfirmasi     // (keep for backward compat, tapi gunakan yang baru)
     diproses                // Pembayaran dikonfirmasi, sedang diproses
     dikirim                 // Sedang dikirim
     selesai                 // Pesanan selesai
     dibatalkan              // Dibatalkan
   }
   ```

3. **Jalankan migration:**
   ```bash
   npx prisma migrate dev --name add_resi_midtrans_alamat_snapshot
   ```

4. **Update `app/api/checkout/route.ts`:**
   - Saat membuat pesanan, simpan alamat sebagai snapshot:
     ```ts
     alamatSnapshot: JSON.stringify({
       namaPenerima: alamat.namaPenerima,
       nomorTelepon: alamat.nomorTelepon,
       alamatLengkap: alamat.alamatLengkap,
       kota: alamat.kota,
       provinsi: alamat.provinsi,
       kodePos: alamat.kodePos,
     }),
     ```
   - Update status awal sesuai metode:
     - COD → `statusPesanan: 'diproses'` (menunggu pengiriman)
     - Transfer → `statusPesanan: 'menunggu_pembayaran'`
     - E-wallet/QRIS → `statusPesanan: 'menunggu_pembayaran'`

5. **Update tampilan pesanan (admin & user)** yang membaca alamat:
   - Prioritaskan `alamatSnapshot` jika ada (JSON.parse)
   - Fallback ke relasi `alamatUser` jika kosong (data lama)

### Acceptance Criteria:
- [ ] Migration berhasil tanpa error
- [ ] Data lama tetap bisa diakses (backward-compatible)
- [ ] Pesanan baru menyimpan alamat snapshot
- [ ] Field `resi` tersedia di schema
- [ ] Field `midtransOrderId` tersedia di schema
- [ ] Enum StatusPesanan punya `menunggu_pembayaran` dan `menunggu_verifikasi`
- [ ] `npm run dev` berjalan tanpa error setelah migrasi
```

---

## Phase 4: Checkout Transaction & Stock Validation 🔴

**Prioritas:** KRITIS
**PRD Rules:** C1, D1, D2, D3, D5, D6, D7, D8, J1, J4
**Estimasi file yang diubah:** ~3 file

### Prompt:

```
Baca PRD.md Section 12.4 (D1-D10), 12.9 (Stok Lifecycle), 12.12 (J1-J4).
Baca GAP_ANALYSIS.md Section 5.4, 5.12.

MASALAH KRITIS:
- Checkout TIDAK dalam database transaction → data bisa inkonsisten
- Stok TIDAK divalidasi sebelum order → bisa order lebih dari stok
- Race condition → 2 user bisa beli stok terakhir bersamaan
- Stok TIDAK dikembalikan saat pembatalan

TUGAS:

1. **Rewrite `app/api/checkout/route.ts` dengan `prisma.$transaction`:**
   
   ```ts
   /**
    * POST /api/checkout
    * Membuat pesanan baru dari keranjang user.
    * Semua operasi dalam 1 database transaction (rule J1).
    * - Validasi stok final (D1)
    * - Kurangi stok (D2)
    * - Snapshot harga (D5)
    * - Hitung subtotal server-side (D6, D7, J4)
    * - Kosongkan cart (D8)
    */
   export async function POST(request: Request) {
     // ... auth check, input validation ...
     
     const result = await prisma.$transaction(async (tx) => {
       // 1. Ambil keranjang + items
       const keranjang = await tx.keranjang.findUnique({
         where: { idUser: user.idUser },
         include: { itemKeranjang: { include: { buku: true } } }
       });
       
       if (!keranjang || keranjang.itemKeranjang.length === 0) {
         throw new Error('CART_EMPTY');
       }
       
       // 2. Validasi stok final (D1) — re-check setiap buku
       const stokErrors: string[] = [];
       for (const item of keranjang.itemKeranjang) {
         // Fetch buku terbaru DALAM transaction
         const buku = await tx.buku.findUnique({
           where: { idBuku: item.idBuku }
         });
         if (!buku || !buku.statusAktif) {
           stokErrors.push(`"${item.buku.judul}" sudah tidak tersedia`);
         } else if (buku.stok < item.jumlah) {
           stokErrors.push(
             `Stok "${buku.judul}" tersisa ${buku.stok}, Anda memesan ${item.jumlah}`
           );
         }
       }
       if (stokErrors.length > 0) {
         throw new Error('STOCK_ERROR:' + JSON.stringify(stokErrors));
       }
       
       // 3. Validasi alamat milik user
       const alamat = await tx.alamatUser.findUnique({
         where: { idAlamat: Number(idAlamat) }
       });
       if (!alamat || alamat.idUser !== user.idUser) {
         throw new Error('INVALID_ADDRESS');
       }
       
       // 4. Hitung harga dari database (J4)
       let subtotal = 0;
       const detailItems = keranjang.itemKeranjang.map(item => {
         const hargaSatuan = Number(item.buku.harga); // snapshot harga saat ini (D5)
         const itemSubtotal = hargaSatuan * item.jumlah; // D6
         subtotal += itemSubtotal;
         return {
           idBuku: item.idBuku,
           jumlah: item.jumlah,
           hargaSatuan,
           subtotal: itemSubtotal,
         };
       });
       
       // 5. Hitung ongkir & pajak
       // ... (ambil dari TarifOngkir & PengaturanToko) ...
       
       // 6. Generate kode pesanan unik (D9)
       // ... generateOrderCode() ...
       
       // 7. Buat pesanan (D7 — total dihitung server)
       const pesanan = await tx.pesanan.create({
         data: {
           kodePesanan,
           idUser: user.idUser,
           idAlamat: alamat.idAlamat,
           alamatSnapshot: JSON.stringify({ ... }),
           metodePembayaran,
           statusPembayaran: ..., // sesuai metode
           statusPesanan: ...,    // sesuai metode
           subtotal,
           ongkir,
           pajakPersen,
           pajakNominal,
           totalBayar,            // D7
           detailPesanan: {
             create: detailItems  // D5 — harga sudah di-snapshot
           }
         }
       });
       
       // 8. Kurangi stok (D2) — dalam transaction (D3 prevention)
       for (const item of keranjang.itemKeranjang) {
         await tx.buku.update({
           where: { idBuku: item.idBuku },
           data: { stok: { decrement: item.jumlah } }
         });
       }
       
       // 9. Kosongkan cart (D8)
       await tx.itemKeranjang.deleteMany({
         where: { idKeranjang: keranjang.idKeranjang }
       });
       
       return pesanan;
     });
     
     // ... return response
   }
   ```

2. **Tambahkan validasi stok di cart — `app/api/keranjang/route.ts` POST:**
   ```ts
   // C1: Cek stok sebelum tambah ke cart
   const buku = await prisma.buku.findUnique({ where: { idBuku } });
   if (!buku || !buku.statusAktif) {
     return NextResponse.json({ error: 'Buku tidak tersedia' }, { status: 404 });
   }
   if (buku.stok <= 0) {
     return NextResponse.json({ error: 'Stok habis' }, { status: 400 }); // C4
   }
   // Cek total qty (existing + baru) <= stok (C3)
   const existingItem = await prisma.itemKeranjang.findFirst({ ... });
   const totalQty = (existingItem?.jumlah || 0) + jumlah;
   if (totalQty > buku.stok) {
     return NextResponse.json({
       error: `Stok tersedia hanya ${buku.stok}. Anda sudah memiliki ${existingItem?.jumlah || 0} di keranjang.`
     }, { status: 400 }); // C1
   }
   ```

3. **Tambahkan validasi stok di cart update — `app/api/keranjang/[id]/route.ts` PUT:**
   ```ts
   // C1: Qty tidak boleh melebihi stok
   if (jumlah > buku.stok) {
     return NextResponse.json({
       error: `Stok tersedia hanya ${buku.stok}`
     }, { status: 400 });
   }
   // C2: Qty 0 → hapus item, negatif → tolak
   if (jumlah <= 0) {
     await prisma.itemKeranjang.delete({ where: { idItem } });
     return NextResponse.json({ message: 'Item dihapus dari keranjang' });
   }
   ```

4. **Auto-adjust & auto-remove di cart GET — `app/api/keranjang/route.ts` GET:**
   ```ts
   // C5: Auto-adjust jika stok berkurang
   // C6: Auto-remove jika buku tidak aktif
   const warnings: string[] = [];
   for (const item of keranjang.itemKeranjang) {
     if (!item.buku.statusAktif) {
       await prisma.itemKeranjang.delete({ where: { idItem: item.idItem } });
       warnings.push(`"${item.buku.judul}" sudah tidak tersedia dan dihapus dari keranjang`);
     } else if (item.jumlah > item.buku.stok) {
       if (item.buku.stok === 0) {
         await prisma.itemKeranjang.delete({ where: { idItem: item.idItem } });
         warnings.push(`"${item.buku.judul}" stok habis dan dihapus dari keranjang`);
       } else {
         await prisma.itemKeranjang.update({
           where: { idItem: item.idItem },
           data: { jumlah: item.buku.stok }
         });
         warnings.push(`Stok "${item.buku.judul}" berubah, disesuaikan menjadi ${item.buku.stok}`);
       }
     }
   }
   // Re-fetch setelah adjustment
   // Return: { items, warnings, totalAmount }
   ```

### Acceptance Criteria:
- [ ] Checkout dalam 1 `prisma.$transaction` (J1)
- [ ] Stok di-recheck sebelum order dibuat (D1)
- [ ] Stok dikurangi dalam transaction yang sama (D2, D3)
- [ ] Harga di-snapshot dari database, bukan client (D5, J4)
- [ ] Cart: tambah item cek stok (C1, C4)
- [ ] Cart: update qty cek stok (C1), qty 0 = hapus (C2)
- [ ] Cart GET: auto-adjust stok berubah (C5), auto-remove buku dihapus (C6)
- [ ] Error checkout menampilkan detail item bermasalah
- [ ] `npm run dev` berjalan tanpa error ataupun npm run build
```

---

## Phase 5: Status Transition & Stock Restore 🔴

**Prioritas:** KRITIS
**PRD Rules:** 12.8 (Status Transition), 12.9 (Stok Lifecycle), I1, J2
**Estimasi file yang diubah:** ~3 file

### Prompt:

```
Baca PRD.md Section 12.8 (Status Transition Rules), 12.9 (Stok Lifecycle).
Baca GAP_ANALYSIS.md Section 5.8, 5.9.

MASALAH:
- Admin bisa set status APAPUN tanpa validasi transisi
- Stok TIDAK dikembalikan saat pesanan dibatalkan
- Tidak ada cek resi wajib saat status diubah ke Dikirim (I1)

TUGAS:

1. **Buat `lib/pesanan-status.ts` — Mapping transisi yang valid:**
   ```ts
   /** 
    * Mapping transisi status pesanan yang diizinkan.
    * Sesuai PRD Section 12.8.
    */
   export const VALID_TRANSITIONS: Record<string, string[]> = {
     'menunggu_pembayaran': ['menunggu_verifikasi', 'dibatalkan'],
     'menunggu_verifikasi': ['diproses', 'menunggu_pembayaran', 'dibatalkan'],
     'menunggu_konfirmasi': ['diproses', 'dibatalkan'], // backward compat
     'diproses': ['dikirim', 'dibatalkan'],
     'dikirim': ['selesai', 'dibatalkan'],
     'selesai': [],      // status final
     'dibatalkan': [],    // status final
   };
   
   /**
    * Cek apakah transisi status valid
    */
   export function isValidTransition(from: string, to: string): boolean {
     return VALID_TRANSITIONS[from]?.includes(to) ?? false;
   }
   
   /**
    * Cek apakah status adalah status final (tidak bisa diubah lagi)
    */
   export function isFinalStatus(status: string): boolean {
     return ['selesai', 'dibatalkan'].includes(status);
   }
   ```

2. **Update `app/api/admin/pesanan/[id]/route.ts` PUT:**
   ```ts
   // Validasi transisi status
   if (statusPesananBaru) {
     if (isFinalStatus(pesanan.statusPesanan)) {
       return NextResponse.json({
         error: `Pesanan dengan status "${pesanan.statusPesanan}" tidak bisa diubah`
       }, { status: 400 });
     }
     
     if (!isValidTransition(pesanan.statusPesanan, statusPesananBaru)) {
       return NextResponse.json({
         error: `Tidak bisa mengubah status dari "${pesanan.statusPesanan}" ke "${statusPesananBaru}"`
       }, { status: 400 });
     }
     
     // I1: Resi wajib saat ubah ke Dikirim
     if (statusPesananBaru === 'dikirim' && !resi && !pesanan.resi) {
       return NextResponse.json({
         error: 'Nomor resi wajib diisi sebelum mengirim pesanan'
       }, { status: 400 });
     }
   }
   ```

3. **Implementasi stok restore saat pembatalan:**
   ```ts
   // Jika status baru = dibatalkan → kembalikan stok (12.9)
   // Gunakan transaction (J2)
   if (statusPesananBaru === 'dibatalkan') {
     await prisma.$transaction(async (tx) => {
       // Update status pesanan
       await tx.pesanan.update({
         where: { idPesanan: id },
         data: { statusPesanan: 'dibatalkan', ...otherData }
       });
       
       // Kembalikan stok untuk setiap item
       const details = await tx.detailPesanan.findMany({
         where: { idPesanan: id }
       });
       for (const detail of details) {
         await tx.buku.update({
           where: { idBuku: detail.idBuku },
           data: { stok: { increment: detail.jumlah } }
         });
       }
     });
   }
   ```

4. **I2 — Admin tidak bisa hapus dirinya sendiri:**
   Di `app/api/admin/user/[id]/route.ts` DELETE:
   ```ts
   if (Number(params.id) === admin.idUser) {
     return NextResponse.json({
       error: 'Tidak bisa menghapus akun Anda sendiri'
     }, { status: 400 });
   }
   ```

5. **Update upload bukti — `app/api/user/pesanan/[id]/upload-bukti/route.ts`:**
   - Hanya bisa upload jika status = `menunggu_pembayaran` atau `menunggu_verifikasi` (F4)
   - Setelah upload berhasil, ubah status ke `menunggu_verifikasi` (F5)
   - Hapus file bukti lama jika ada (H6)

6. **Hapus endpoint duplikat:**
   Hapus `app/api/pesanan/[id]/bukti-pembayaran/` — pertahankan hanya
   `app/api/user/pesanan/[id]/upload-bukti/`.

### Acceptance Criteria:
- [ ] Transisi status divalidasi sesuai flow PRD 12.8
- [ ] Status final (selesai/dibatalkan) tidak bisa diubah
- [ ] Pembatalan → stok dikembalikan dalam transaction (J2)
- [ ] Resi wajib saat ubah ke Dikirim (I1)
- [ ] Admin tidak bisa hapus akun sendiri (I2)
- [ ] Upload bukti hanya untuk status menunggu_pembayaran/menunggu_verifikasi (F4)
- [ ] Status berubah ke menunggu_verifikasi setelah upload (F5)
- [ ] Endpoint duplikat dihapus
```

---

## Phase 6: Pagination Seluruh Aplikasi

**Prioritas:** TINGGI
**PRD Rules:** I4 (Pagination semua daftar)
**Estimasi file yang diubah:** ~10 file (API + UI)

### Prompt:

```
Baca PRD.md Section 12.11 rule I4.
Baca GAP_ANALYSIS.md Section 7.2, 5.11.

MASALAH: TIDAK ada pagination di satu pun halaman. Semua data di-load sekaligus.

TUGAS:

1. **Buat helper pagination — `lib/pagination.ts`:**
   ```ts
   /**
    * Helper untuk menghitung skip & take dari query params,
    * dan membentuk response metadata pagination
    */
   export function getPaginationParams(searchParams: URLSearchParams) {
     const page = Math.max(1, Number(searchParams.get('page') || '1'));
     const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || '12')));
     return { page, limit, skip: (page - 1) * limit };
   }
   
   export function paginationMeta(total: number, page: number, limit: number) {
     return {
       total,
       page,
       limit,
       totalPages: Math.ceil(total / limit),
       hasNext: page * limit < total,
       hasPrev: page > 1,
     };
   }
   ```

2. **Tambahkan pagination ke API routes:**
   - `app/api/buku/route.ts` GET — tambahkan `page`, `limit` param, return `{ data, pagination }`
   - `app/api/admin/buku/route.ts` GET — sama
   - `app/api/admin/kategori-buku/route.ts` GET — sama
   - `app/api/admin/user/route.ts` GET — sama
   - `app/api/admin/pesanan/route.ts` GET — sama
   - `app/api/user/pesanan/route.ts` GET — sama

3. **Buat komponen Pagination reusable — `app/_components/Pagination.tsx`:**
   ```tsx
   /**
    * Komponen pagination reusable.
    * Menampilkan tombol halaman, prev/next, dan info "Halaman X dari Y".
    */
   interface PaginationProps {
     currentPage: number;
     totalPages: number;
     onPageChange: (page: number) => void;
   }
   ```
   Desain konsisten dengan UI yang sudah ada (Tailwind, warna tema).

4. **Integrasikan pagination ke halaman UI:**
   - `app/katalog/page.tsx` — tambahkan komponen Pagination, update fetch URL
   - `app/pesanan-saya/page.tsx` — tambahkan pagination
   - `app/admin/buku/page.tsx` — tambahkan pagination di bawah tabel
   - `app/admin/kategori-buku/page.tsx` — tambahkan pagination
   - `app/admin/user/page.tsx` — tambahkan pagination
   - `app/admin/pesanan/page.tsx` — tambahkan pagination

5. **Pastikan search/filter dan pagination berjalan bersamaan:**
   Di setiap halaman, saat search/filter berubah, reset ke page 1.
   URL harus shareable: semua state ada di query params.

### Acceptance Criteria:
- [ ] Semua API list return format `{ data, pagination }`
- [ ] Default 12 items per page (katalog), 10 per page (admin tables)
- [ ] Komponen Pagination tampil dan functional
- [ ] Search/filter reset ke page 1
- [ ] URL shareable (page, search, filter di searchParams)
- [ ] Previous/Next disabled di halaman pertama/terakhir
```

---

## Phase 7: UX Polish — Toast, Dead Buttons, Reload Fix

**Prioritas:** TINGGI
**PRD Rules:** Tech Stack (Sonner), UX consistency
**Estimasi file yang diubah:** ~15 file

### Prompt:

```
Baca GAP_ANALYSIS.md Section 10 (Gap UX & Polish).

MASALAH:
- Semua notifikasi masih pakai `alert()` dan `confirm()` — harus pakai toast
- Banyak tombol dead (tidak navigasi)
- `window.location.reload()` dipakai sebagai pengganti state update

TUGAS:

1. **Install Sonner:**
   ```bash
   npm install sonner
   ```

2. **Setup Toaster di root layout — `app/layout.tsx`:**
   ```tsx
   import { Toaster } from 'sonner';
   // Di dalam body:
   <Toaster position="top-right" richColors closeButton />
   ```

3. **Ganti semua `alert()` dengan `toast` dari Sonner:**
   File yang perlu diubah:
   - `app/buku/[id]/page.tsx` — toast.success('Ditambahkan ke keranjang'), toast.error()
   - `app/keranjang/page.tsx` — toast.success() untuk hapus item
   - `app/profil/page.tsx` — toast.success('Profil berhasil diperbarui')
   - `app/kontak/page.tsx` — toast.success('Pesan terkirim')
   - `app/pesanan-saya/[id]/upload-bukti/page.tsx` — toast.success()
   - `app/checkout/page.tsx` — toast.error() untuk error

4. **Ganti semua `confirm()` dengan dialog konfirmasi yang lebih baik:**
   Di `app/keranjang/page.tsx`, ganti `confirm('Hapus item ini?')` dengan:
   - Bisa pakai custom dialog state, atau cukup `toast` action:
     ```ts
     toast('Yakin hapus item ini?', {
       action: { label: 'Hapus', onClick: () => removeItem(id) },
       cancel: { label: 'Batal' },
     });
     ```

5. **Ganti semua `window.location.reload()` dengan state update / router.refresh():**
   - `app/katalog/page.tsx` — setelah add to cart: update state lokal + `router.refresh()`
   - `app/buku/[id]/page.tsx` — setelah add to cart: `router.refresh()`
   - `app/keranjang/page.tsx` — setelah remove/update item: re-fetch cart data
   - `app/profil/page.tsx` — setelah save: re-fetch profile data

6. **Fix dead buttons:**
   - `app/(marketing)/_components/Hero.tsx`:
     - "Lihat Katalog" → `<Link href="/katalog">`
     - "Daftar Sekarang" → `<Link href="/register">`
   - `app/page.tsx` (CTA section):
     - "Daftar Gratis" → `<Link href="/register">`
     - "Lihat Promo" → `<Link href="/katalog">`
   - `app/admin/dashboard/page.tsx`:
     - "Lihat Semua" pesanan → `<Link href="/admin/pesanan">`

7. **Hapus demo credentials dari login page:**
   Di `app/login/page.tsx`, hapus atau comment out section yang menampilkan
   `admin/admin123` dan `user/user123`.

### Acceptance Criteria:
- [ ] Sonner Toaster tersetup di root layout
- [ ] Semua `alert()` diganti toast
- [ ] Semua `confirm()` diganti toast action atau dialog
- [ ] Semua `window.location.reload()` diganti state update
- [ ] Hero buttons navigasi ke katalog/register
- [ ] CTA buttons navigasi ke register/katalog
- [ ] Dashboard "Lihat Semua" navigasi ke pesanan
- [ ] Demo credentials dihapus dari login
```

---

## Phase 8: Admin Pesanan — Status Management UI Upgrade

**Prioritas:** TINGGI
**PRD Rules:** 12.8 (Status Transition), F6, I1
**Estimasi file yang diubah:** ~3 file

### Prompt:

```
Baca PRD.md Section 5.5 (Daftar Pesanan), 12.8 (Status Transition).
Baca GAP_ANALYSIS.md Section 7.1 (admin pesanan issues).

MASALAH:
- Tombol "Process" logic salah di admin pesanan list
- Admin bisa set status apapun dari dropdown (harus hanya opsi valid)
- Status timeline di pesanan user tidak handle semua status
- Resi belum bisa diinput

TUGAS:

1. **Update `app/admin/pesanan/page.tsx`:**
   - Fix tombol aksi: tampilkan tombol yang sesuai berdasarkan status saat ini
     - `menunggu_pembayaran` → "Lihat Detail" saja
     - `menunggu_verifikasi` → "Verifikasi Pembayaran" (link ke detail)
     - `diproses` → "Kirim" (minta input resi)
     - `dikirim` → "Tandai Selesai"
     - `selesai`/`dibatalkan` → Tidak ada tombol aksi

2. **Update `app/admin/pesanan/[id]/page.tsx`:**
   - Dropdown status: hanya tampilkan opsi transisi yang valid
     berdasarkan status saat ini (gunakan `VALID_TRANSITIONS` dari Phase 5)
   - Section input resi: tampilkan text field untuk nomor resi
     - Wajib diisi saat akan ubah ke `dikirim` (I1)
     - Tampilkan resi yang sudah ada jika ada
   - Section verifikasi pembayaran (F6):
     - Tampilkan gambar bukti pembayaran
     - Tombol "Terima" → status `diproses`
     - Tombol "Tolak" → status `menunggu_pembayaran`
   - Pastikan field resi bisa disimpan ke database (field baru dari Phase 3)

3. **Update `app/pesanan-saya/[id]/page.tsx`:**
   - Status timeline harus handle SEMUA status:
     - Menunggu Pembayaran → Menunggu Verifikasi → Diproses → Dikirim → Selesai
   - Tampilkan nomor resi jika ada (dari field `resi`)
   - Tampilkan alamat dari `alamatSnapshot` (bukan dari relasi)

4. **Update `app/admin/pesanan/page.tsx` tab filter:**
   - Tambahkan tab untuk `menunggu_pembayaran` dan `menunggu_verifikasi`
   - Sesuaikan filter query

### Acceptance Criteria:
- [ ] Tombol aksi di list pesanan sesuai dengan status
- [ ] Dropdown status hanya menampilkan transisi yang valid
- [ ] Input resi berfungsi dan tersimpan
- [ ] Verifikasi pembayaran: tombol terima/tolak
- [ ] Status timeline di user pesanan handle semua status
- [ ] Nomor resi ditampilkan ke user jika ada
- [ ] Alamat pesanan dari snapshot
```

---

## Phase 9: Admin Responsive & UI Bug Fixes

**Prioritas:** SEDANG
**PRD Rules:** UX, responsive design
**Estimasi file yang diubah:** ~5 file

### Prompt:

```
Baca GAP_ANALYSIS.md Section 7.1 (UI bugs), 10.2 (Responsiveness).

MASALAH:
- Admin sidebar fixed 72px, tidak responsive, tidak ada mobile handling
- Beberapa UI bug kecil (colSpan mismatch, dll)
- Export CSV button dead

TUGAS:

1. **Admin sidebar responsive — `app/admin/_components/Sidebar.tsx`:**
   - Mobile (< 768px): Sidebar tersembunyi, bisa dibuka via hamburger button
   - Gunakan state `isOpen` + overlay backdrop
   - Tombol hamburger di `Topbar.tsx` untuk toggle sidebar di mobile
   - Desktop: Sidebar tetap fixed seperti sekarang

2. **Update `app/admin/layout.tsx`:**
   - Di mobile: main content full-width (tanpa `pl-72`)
   - Conditional padding berdasarkan viewport

3. **Update `app/admin/_components/Topbar.tsx`:**
   - Mobile: Tambahkan tombol hamburger di kiri
   - Mobile: `left-0` (tanpa offset sidebar)
   - Desktop: Tetap `left-72`

4. **Fix bug UI admin kategori — `app/admin/kategori-buku/page.tsx`:**
   - Fix `colSpan` mismatch (4 → sesuaikan dengan jumlah kolom tabel)

5. **Fix bug admin pesanan — `app/admin/pesanan/page.tsx`:**
   - Fix logic `handleProcessOrder` — sesuaikan di Phase 8
   
6. **Implementasi Export CSV — `app/admin/laporan/page.tsx`:**
   - Tombol "Export CSV": generate CSV dari data transaksi yang ditampilkan
   - Download otomatis via `Blob` + `URL.createObjectURL`

### Acceptance Criteria:
- [ ] Admin sidebar collapsible di mobile (hamburger toggle)
- [ ] Admin layout responsive di semua viewport (375, 768, 1280)
- [ ] colSpan bug fixed
- [ ] Export CSV button fungsional
```

---

## Phase 10: Dashboard & Laporan Fix

**Prioritas:** SEDANG
**PRD Rules:** I3 (Dashboard hitung Selesai saja)
**Estimasi file yang diubah:** ~2 file

### Prompt:

```
Baca PRD.md Section 12.11 rule I3.
Baca GAP_ANALYSIS.md Section 5.11.

MASALAH:
- Dashboard menghitung pendapatan dari semua pesanan terkonfirmasi, seharusnya
  hanya dari pesanan dengan status `selesai` (I3)

TUGAS:

1. **Update `app/api/admin/dashboard/route.ts`:**
   - `pendapatanBulanIni`: hitung SUM `totalBayar` hanya dari pesanan
     dengan `statusPesanan: 'selesai'` dalam bulan ini
   - `pendapatanHariIni`: sama, filter hari ini
   - Pastikan chart data juga hanya hitungan pesanan selesai
   - Tambahkan metric: `pesananMenunggu` (count pesanan menunggu_pembayaran + menunggu_verifikasi)

2. **Update `app/admin/dashboard/page.tsx`:**
   - Tambahkan card "Pesanan Menunggu" (pesanan yang butuh perhatian admin)
   - Link "Lihat Semua" wired ke `/admin/pesanan` (sudah di Phase 7)

### Acceptance Criteria:
- [ ] Pendapatan dihitung hanya dari pesanan `selesai` (I3)
- [ ] Chart data akurat
- [ ] Card "Pesanan Menunggu" tampil
```

---

## Phase 11: Upload Compression & File Management

**Prioritas:** SEDANG
**PRD Rules:** H1-H7 (Upload & Compression)
**Estimasi file yang diubah:** ~6 file

### Prompt:

```
Baca PRD.md Section 12.10 (H1-H7).
Baca GAP_ANALYSIS.md Section 5.10.

MASALAH:
- Tidak ada client-side image compression (H2)
- Tidak ada penghapusan file lama saat re-upload (H6)

TUGAS:

1. **Install browser-image-compression:**
   ```bash
   npm install browser-image-compression
   ```

2. **Buat helper compression — `lib/image-compress.ts`:**
   ```ts
   import imageCompression from 'browser-image-compression';
   
   /**
    * Compress gambar di client-side sebelum upload (H2).
    * Target: ≤ 1MB, max width 1920px, kualitas 0.7-0.8
    */
   export async function compressImage(file: File): Promise<File> {
     const options = {
       maxSizeMB: 1,
       maxWidthOrHeight: 1920,
       initialQuality: 0.8,
       useWebWorker: true,
     };
     const compressed = await imageCompression(file, options);
     // H3: Safety net — jika masih > 2MB, tolak
     if (compressed.size > 2 * 1024 * 1024) {
       throw new Error('Gambar terlalu besar setelah kompresi. Gunakan gambar yang lebih kecil.');
     }
     return compressed;
   }
   ```

3. **Terapkan compression di halaman upload:**
   - `app/pesanan-saya/[id]/upload-bukti/page.tsx`: compress sebelum FormData append
   - `app/admin/buku/page.tsx`: compress cover buku sebelum upload
   - `app/profil/page.tsx`: compress foto profil sebelum upload
   - `app/admin/pengaturan/page.tsx`: compress QRIS image sebelum upload

4. **Hapus file lama saat re-upload (H6):**
   Buat helper `lib/upload.ts`:
   ```ts
   import fs from 'fs/promises';
   import path from 'path';
   
   /**
    * Hapus file dari public/uploads jika ada (H6)
    */
   export async function deleteOldFile(filePath: string | null | undefined) {
     if (!filePath) return;
     try {
       const fullPath = path.join(process.cwd(), 'public', filePath);
       await fs.unlink(fullPath);
     } catch { /* file mungkin sudah tidak ada */ }
   }
   ```
   Terapkan di:
   - Upload bukti pembayaran (re-upload)
   - Update cover buku
   - Update foto profil
   - Update QRIS image

### Acceptance Criteria:
- [ ] Gambar di-compress otomatis di browser sebelum upload (H2)
- [ ] Gambar > 2MB setelah compress ditolak (H3)
- [ ] File lama dihapus saat re-upload (H6)
- [ ] MIME type divalidasi di server (H4) — sudah dari Phase 2
```

---

## Phase 12: Pesanan User — Filter & Upload Bukti Flow

**Prioritas:** SEDANG
**PRD Rules:** 4.10 (Riwayat Pesanan), F1-F6
**Estimasi file yang diubah:** ~3 file

### Prompt:

```
Baca PRD.md Section 4.10, 12.6 (F1-F6).

TUGAS:

1. **Tambahkan filter status di `app/pesanan-saya/page.tsx`:**
   - Tab filter: Semua, Menunggu Pembayaran, Diproses, Dikirim, Selesai, Dibatalkan
   - Gunakan query params agar shareable: `?status=dikirim`
   - Jumlah per tab ditampilkan (badge count)

2. **Perbaiki flow upload bukti di `app/pesanan-saya/[id]/page.tsx`:**
   - Tombol "Upload Bukti" hanya tampil jika status = `menunggu_pembayaran`
   - Tampilkan bukti yang sudah diupload jika status = `menunggu_verifikasi`
   - Info "Menunggu verifikasi admin" jika sudah upload

3. **Tampilkan info pembayaran berdasarkan metode:**
   - COD: "Bayar saat barang diterima"
   - Transfer Bank: Nomor rekening toko (dari PengaturanToko), tombol upload
   - E-wallet/QRIS: QR code/info, tombol upload

### Acceptance Criteria:
- [ ] Tab filter status berfungsi di pesanan-saya
- [ ] Upload bukti hanya muncul pada status yang tepat
- [ ] Info pembayaran sesuai metode
```

---

## Phase 13: Integrasi Midtrans (Opsional)

**Prioritas:** SEDANG (bisa di-skip jika waktu terbatas)
**PRD Rules:** G1-G6, Section 9
**Estimasi file baru:** ~4 file

### Prompt:

```
Baca PRD.md Section 9 (Integrasi Midtrans), 12.7 (G1-G6).

CATATAN: Phase ini opsional. Jika waktu terbatas, fokus di phase lain.
Fitur e-wallet dan QRIS di schema sudah ada — Midtrans Snap mendukung keduanya.

TUGAS:

1. **Install midtrans-client:**
   ```bash
   npm install midtrans-client
   ```

2. **Buat helper Midtrans — `lib/midtrans.ts`:**
   ```ts
   import midtransClient from 'midtrans-client';
   
   /** Konfigurasi Midtrans Snap client */
   const snap = new midtransClient.Snap({
     isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
     serverKey: process.env.MIDTRANS_SERVER_KEY!,
     clientKey: process.env.MIDTRANS_CLIENT_KEY!,
   });
   
   /** Generate Midtrans snap token untuk pembayaran (G2) */
   export async function createSnapTransaction(params: {
     orderId: string;
     amount: number;
     customerName: string;
     customerEmail: string;
     items: Array<{ id: string; name: string; price: number; quantity: number }>;
   }) { ... }
   
   /** Verifikasi signature webhook Midtrans (G3) */
   export function verifySignature(notification: any): boolean { ... }
   ```

3. **Buat API — `app/api/payment/midtrans/route.ts` (POST):**
   - Terima `orderId` dari body
   - Ambil pesanan, validasi status = `menunggu_pembayaran` dan metode = midtrans-compatible
   - Generate snap token via helper
   - Return `{ snapToken }`

4. **Buat webhook — `app/api/payment/midtrans/callback/route.ts` (POST):**
   - Terima notification dari Midtrans
   - Verifikasi signature (G3)
   - Idempotency check: jika status sudah berubah, skip (G4)
   - Status mapping (G5):
     - `settlement/capture` → `diproses`
     - `pending` → tetap `menunggu_pembayaran`
     - `deny/cancel/expire` → `dibatalkan` + restore stok (G6, J2)
   - Gunakan transaction untuk update status + restore stok

5. **Update checkout flow di `app/checkout/page.tsx`:**
   - Jika metode = e-wallet/qris:
     - Setelah create order, panggil `/api/payment/midtrans`
     - Load Midtrans Snap JS via script tag
     - Tampilkan Snap popup
   - Handle callback result (success/pending/error)

6. **Environment variables:**
   ```env
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
   MIDTRANS_IS_PRODUCTION=false
   ```

### Acceptance Criteria:
- [ ] Snap token berhasil di-generate (G2)
- [ ] Midtrans Snap popup tampil di frontend
- [ ] Webhook menerima dan memproses notifikasi (G3)
- [ ] Status mapping benar (G5)
- [ ] Idempotency: webhook duplikat di-handle (G4)
- [ ] Stok dikembalikan saat expire/cancel (G6, J2)
```

---

## Phase 14: Auto-Cancel Timeout (Cron)

**Prioritas:** SEDANG
**PRD Rules:** F7 (24 jam timeout), G6
**Estimasi file baru:** ~2 file

### Prompt:

```
Baca PRD.md Section 12.6 rule F7, 12.7 rule G6.

MASALAH: Pesanan transfer yang tidak diupload buktinya dalam 24 jam
harus otomatis dibatalkan dan stoknya dikembalikan.

TUGAS:

1. **Buat API cron endpoint — `app/api/cron/expire-orders/route.ts`:**
   ```ts
   /**
    * API endpoint untuk membatalkan pesanan yang sudah
    * melewati batas waktu 24 jam (F7, G6).
    * Dipanggil secara berkala via cron job.
    */
   export async function POST(request: Request) {
     // Verifikasi CRON_SECRET dari header
     const secret = request.headers.get('x-cron-secret');
     if (secret !== process.env.CRON_SECRET) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     
     const batasWaktu = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 jam lalu
     
     // Cari pesanan yang sudah lewat waktu
     const expiredOrders = await prisma.pesanan.findMany({
       where: {
         statusPesanan: 'menunggu_pembayaran',
         tanggalPesan: { lt: batasWaktu },
       },
       include: { detailPesanan: true },
     });
     
     // Batalkan satu per satu dalam transaction
     for (const order of expiredOrders) {
       await prisma.$transaction(async (tx) => {
         // Update status
         await tx.pesanan.update({
           where: { idPesanan: order.idPesanan },
           data: { statusPesanan: 'dibatalkan' },
         });
         // Kembalikan stok
         for (const detail of order.detailPesanan) {
           await tx.buku.update({
             where: { idBuku: detail.idBuku },
             data: { stok: { increment: detail.jumlah } },
           });
         }
       });
     }
     
     return NextResponse.json({
       message: `${expiredOrders.length} pesanan dibatalkan`,
     });
   }
   ```

2. **Setup Vercel Cron (jika deploy ke Vercel) — `vercel.json`:**
   ```json
   {
     "crons": [{
       "path": "/api/cron/expire-orders",
       "schedule": "0 * * * *"
     }]
   }
   ```
   Atau bisa dipanggil manual via curl untuk development.

### Acceptance Criteria:
- [ ] Pesanan > 24 jam menunggu_pembayaran otomatis dibatalkan (F7)
- [ ] Stok dikembalikan saat auto-cancel (12.9)
- [ ] Endpoint dilindungi CRON_SECRET
- [ ] Cron berjalan setiap jam (atau sesuai config)
```

---

## Phase 15: Error Handling & Loading States

**Prioritas:** RENDAH
**PRD Rules:** UX polish
**Estimasi file yang diubah:** ~8 file

### Prompt:

```
Baca GAP_ANALYSIS.md Section 10.3 (Loading & Error States).

TUGAS:

1. **Buat halaman 404 custom — `app/not-found.tsx`:**
   - Desain menarik sesuai tema BukuCerdas
   - Tombol "Kembali ke Beranda"
   - Ilustrasi atau emoji dekoratif

2. **Buat error boundary — `app/error.tsx`:**
   - Tangkap error runtime
   - Tampilkan pesan error yang friendly
   - Tombol "Coba Lagi" (reset error boundary)

3. **Perbaiki error states di halaman yang masih minimal:**
   - `app/katalog/page.tsx` — tambahkan tampilan error jika fetch gagal
   - `app/keranjang/page.tsx` — tampilkan error state
   - `app/checkout/page.tsx` — error state jika gagal load cart
   - `app/admin/pesanan/[id]/page.tsx` — ganti "Loading..." text dengan skeleton

4. **Pastikan semua halaman punya loading skeleton yang konsisten:**
   - Pattern: card skeleton (rounded rectangle + pulse animation)
   - Gunakan pattern yang sudah ada di katalog/admin buku

5. **SEO metadata per halaman:**
   Tambahkan `metadata` export di setiap page.tsx:
   ```ts
   export const metadata = {
     title: 'Katalog Buku - BukuCerdas',
     description: 'Temukan buku terbaik di BukuCerdas',
   };
   ```

### Acceptance Criteria:
- [ ] Halaman 404 custom dengan desain menarik
- [ ] Error boundary menangkap runtime errors
- [ ] Error state di semua halaman data-fetching
- [ ] Loading skeleton konsisten
- [ ] SEO metadata di setiap halaman
```

---

## Phase 16: WhatsApp & Contact Page Fix

**Prioritas:** RENDAH
**PRD Rules:** 4.5 (Contact WhatsApp)
**Estimasi file yang diubah:** ~1 file

### Prompt:

```
Baca PRD.md Section 4.5.
Baca GAP_ANALYSIS.md Section 7.1 (kontak issues).

MASALAH:
- WhatsApp number hardcoded di kontak page
- PRD bilang contact TIDAK simpan ke database (hanya WA redirect),
  tapi project menyimpan ke DB (sebenarnya ini fitur bonus yang bagus, keep it)

TUGAS:

1. **Gunakan environment variable untuk WhatsApp number:**
   - Buat `NEXT_PUBLIC_ADMIN_WHATSAPP` di `.env`
   - Di `app/kontak/page.tsx`:
     ```ts
     const waNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '6281234567890';
     ```

2. **Pastikan tombol WhatsApp membuka link yang benar:**
   ```ts
   const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
   window.open(waUrl, '_blank');
   ```

### Acceptance Criteria:
- [ ] WhatsApp number dari environment variable
- [ ] Link WhatsApp benar dan bisa dibuka
```

---

## Ringkasan Phase

| # | Phase | Fokus | Prioritas | PRD Rules |
|---|-------|-------|:---------:|-----------|
| 1 | Admin Auth Guard | Keamanan API admin | 🔴 KRITIS | A6, 10 |
| 2 | Ownership & Validation | Keamanan data + Zod | 🔴 KRITIS | B2-B7, C7, D10, H1-H4 |
| 3 | Schema Update | Tambah field Pesanan | 🔴 KRITIS | 6, G1, I1 |
| 4 | Checkout Transaction | Transaction + stock | 🔴 KRITIS | C1-C6, D1-D3, J1, J4 |
| 5 | Status Transition | Validasi status + stok restore | 🔴 KRITIS | 12.8, 12.9, I1, I2, J2 |
| 6 | Pagination | Semua list/pagination | 🟡 TINGGI | I4 |
| 7 | UX Polish | Toast, dead buttons, reload | 🟡 TINGGI | UX |
| 8 | Admin Pesanan UI | Status management, resi | 🟡 TINGGI | 12.8, F6, I1 |
| 9 | Admin Responsive | Sidebar mobile, UI bugs | 🟢 SEDANG | UX |
| 10 | Dashboard Fix | Pendapatan Selesai saja | 🟢 SEDANG | I3 |
| 11 | Upload Compression | Image compress + cleanup | 🟢 SEDANG | H1-H7 |
| 12 | Pesanan User Filter | Tab status, upload flow | 🟢 SEDANG | 4.10, F1-F6 |
| 13 | Midtrans (Opsional) | Payment gateway | 🟢 SEDANG | G1-G6 |
| 14 | Auto-Cancel Cron | Timeout 24 jam | 🟢 SEDANG | F7, G6 |
| 15 | Error & Loading | 404, error boundary, SEO | 🔵 RENDAH | UX |
| 16 | WhatsApp Fix | Env variable WA number | 🔵 RENDAH | 4.5 |

---

## Urutan Eksekusi yang Disarankan

```
Phase 1 (Auth Guard)          ← paling kritis, paling cepat
  ↓
Phase 2 (Validation)          ← keamanan
  ↓
Phase 3 (Schema Update)       ← prasyarat untuk Phase 4, 5, 8
  ↓
Phase 4 (Checkout Transaction) ← data integrity
  ↓
Phase 5 (Status Transition)    ← business logic inti
  ↓
Phase 7 (UX Polish)            ← quick win, UX improvement
  ↓
Phase 6 (Pagination)           ← semua halaman
  ↓
Phase 8 (Admin Pesanan UI)     ← butuh Phase 3 & 5 selesai
  ↓
Phase 9-16                     ← paralel/urutan bebas
```

---

## Dependency Graph

```
Phase 1 ─→ Phase 2 ─→ Phase 3 ─→ Phase 4 ─→ Phase 5
                         │                      │
                         ├──→ Phase 8 ←─────────┘
                         │
                         └──→ Phase 13 (Midtrans, butuh schema)
                                  │
                                  └──→ Phase 14 (Cron, butuh Midtrans status)

Phase 6 (independen, bisa kapan saja)
Phase 7 (independen, bisa kapan saja)
Phase 9-12 (independen)
Phase 15-16 (independen, terakhir)
```

---

## Coverage Setelah Semua Phase Selesai

| Area | Sebelum | Sesudah | PRD Rules Covered |
|------|:-------:|:-------:|-------------------|
| Auth & Keamanan | 90% | **100%** | A1-A7 ✅ |
| Buku & Kategori | 60% | **95%** | B1-B7 ✅ |
| Cart | 40% | **95%** | C1-C9 ✅ |
| Checkout & Order | 50% | **95%** | D1-D10 ✅ |
| COD | 80% | **100%** | E1-E2 ✅ |
| Transfer Bank | 40% | **95%** | F1-F7 ✅ |
| Midtrans | 0% | **90%** | G1-G6 ✅ (Phase 13) |
| Status & Stok | 20% | **100%** | 12.8, 12.9 ✅ |
| Upload | 30% | **95%** | H1-H7 ✅ |
| Admin | 65% | **95%** | I1-I4 ✅ |
| Concurrency | 10% | **95%** | J1-J4 ✅ |
| UI/UX | 70% | **95%** | Pagination, Toast, Responsive ✅ |
| **Keseluruhan** | **~55%** | **~95%** | |
