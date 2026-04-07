# Development Plan — USK BookStore

Dokumen ini berisi **prompt per phase** yang bisa langsung dilempar ke AI Agent. Setiap phase memiliki:
- **UI/Design direction** — panduan desain spesifik agar tampilan premium
- **Business logic rules** — cross-reference ke PRD.md section 12
- **Testing** — unit test / integration test yang harus dibuat

> **Aturan Umum untuk SEMUA Phase:**
> - Selalu baca `PRD.md` terlebih dahulu sebelum memulai phase apapun
> - Baca skill `shadcn` (`.agents/skills/shadcn/SKILL.md`) saat membuat UI component
> - Baca skill `vercel-react-best-practices` (`.agents/skills/vercel-react-best-practices/SKILL.md`) saat menulis React/Next.js code
> - Baca skill `frontend-design` (`.agents/skills/frontend-design/SKILL.md`) saat mendesain halaman/layout — **WAJIB** ikuti panduan anti-generic aesthetics
> - Gunakan Context7 (`mcp_io_github_ups_resolve-library-id` + `mcp_io_github_ups_get-library-docs`) untuk fetch dokumentasi library terbaru sebelum implementasi
> - Setiap fungsi/modul **wajib ada komentar deskripsi** (persyaratan USK)
> - Kode harus mengikuti **guidelines dan best practices** (TypeScript strict, proper error handling)
> - **Testing framework:** Vitest + React Testing Library + MSW (Mock Service Worker)

---

## Phase 0: Inisialisasi Project, Prisma & Testing Setup

### PRD Rules: -

### Prompt:

```
Baca file PRD.md di root project untuk memahami keseluruhan requirement.

Gunakan Context7 untuk fetch docs terbaru dari Next.js, Prisma, dan Vitest sebelum memulai.

1. **Buat project Next.js:**
   `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`

2. **Install core dependencies:**
   - `prisma` + `@prisma/client`
   - `next-auth@beta` (v5 / Auth.js)
   - `bcrypt` + `@types/bcrypt`
   - `zod`
   - `midtrans-client`
   - `browser-image-compression`

3. **Install testing dependencies:**
   - `vitest` + `@vitejs/plugin-react`
   - `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`
   - `msw` (Mock Service Worker — untuk mock API)
   - `@vitest/coverage-v8` (coverage report)
   - Buat `vitest.config.ts`:
     ```ts
     import { defineConfig } from 'vitest/config'
     import react from '@vitejs/plugin-react'
     import path from 'path'
     export default defineConfig({
       plugins: [react()],
       test: {
         environment: 'jsdom',
         globals: true,
         setupFiles: ['./src/tests/setup.ts'],
         include: ['src/**/*.test.{ts,tsx}'],
         coverage: { provider: 'v8', reporter: ['text', 'html'] }
       },
       resolve: { alias: { '@': path.resolve(__dirname, './src') } }
     })
     ```
   - Buat `src/tests/setup.ts`:
     ```ts
     import '@testing-library/jest-dom/vitest'
     ```
   - Tambahkan scripts di `package.json`:
     ```json
     "test": "vitest run",
     "test:watch": "vitest",
     "test:coverage": "vitest run --coverage"
     ```

4. **Inisialisasi shadcn/ui:**
   Jalankan `npx shadcn@latest init` — pilih preset yang sesuai (misalnya base-nova).
   Setelah init, jalankan `npx shadcn@latest info --json` untuk verifikasi konfigurasi.

5. **Setup Prisma** (`npx prisma init --datasource-provider mysql`):
   Buat schema.prisma sesuai Data Model di PRD.md Section 6:
   - Model: User, Category, Book, Order, OrderDetail, Cart
   - Semua relasi, enum (Role), default values, @@index, unique constraints
   - `created_at` dan `updated_at` dengan @default(now()) dan @updatedAt

6. **Buat `src/lib/prisma.ts`** — Prisma Client singleton (cegah connection exhaustion di dev).

7. **Buat `.env.example`:**
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/usk_bookstore"
   AUTH_SECRET="your-secret-here"
   AUTH_URL="http://localhost:3000"
   MIDTRANS_SERVER_KEY=""
   MIDTRANS_CLIENT_KEY=""
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=""
   MIDTRANS_IS_PRODUCTION=false
   NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER="6281234567890"
   CRON_SECRET="your-cron-secret"
   ```

8. **Jalankan `npx prisma db push`** untuk sync schema.

### Testing:

Buat `src/tests/prisma-schema.test.ts`:
```ts
// Tes bahwa schema Prisma valid dan semua model bisa diinstansiasi
// - Pastikan semua model ada (User, Category, Book, Order, OrderDetail, Cart)
// - Pastikan relasi terdefinisi dengan benar
// - Pastikan enum Role punya 'admin' dan 'user'
```

### Acceptance Criteria:
- [ ] `npm run dev` berjalan tanpa error
- [ ] `npx prisma validate` sukses
- [ ] shadcn/ui terinstall (`npx shadcn@latest info` menunjukkan config valid)
- [ ] Database terbuat dan schema ter-sync
- [ ] `npm run test` berjalan tanpa error (walaupun belum ada banyak test)
- [ ] Testing infrastructure siap (vitest + RTL + MSW)
```

---

## Phase 1: Seed Data & Utility Functions

### PRD Rules: D9 (order code format)

### Prompt:

```
Baca PRD.md Section 6 (Data Model) dan Section 12 (Business Logic).

1. **Buat `src/lib/utils.ts`:**
   - `cn()` — class name merging (clsx + tailwind-merge). Jika shadcn sudah generate ini, gunakan yang ada.
   - `formatRupiah(amount: number)` — format angka ke "Rp 150.000"
   - `generateOrderCode()` — format: `ORD-{YYYYMMDD}-{4 digit random}` (rule D9)

2. **Buat `src/types/index.ts`:**
   - Export TypeScript types/interfaces yang diperlukan:
     - `OrderStatus` = "Menunggu Pembayaran" | "Menunggu Verifikasi" | "Menunggu Pengiriman" | "Dikirim" | "Selesai" | "Dibatalkan"
     - `PaymentMethod` = "COD" | "TRANSFER" | "MIDTRANS"
     - `VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]>` — mapping transisi status yang valid sesuai PRD 12.8
   - Prisma generated types sebagai base, helper types untuk frontend

3. **Buat `prisma/seed.ts`:**
   - 1 admin: admin@bookstore.com / admin123
   - 3 user sample
   - 6 kategori: Novel, Komik, Sains, Sejarah, Teknologi, Agama
   - 15+ buku sample (3+ per kategori) — gunakan gambar dari picsum.photos/300/400
   - Password semua di-hash dengan bcrypt

4. **Konfigurasi seed script** di package.json:
   ```json
   "prisma": { "seed": "ts-node --compiler-options {\"module\":\"commonjs\"} prisma/seed.ts" }
   ```

5. **Jalankan `npx prisma db seed`**

### Testing:

Buat `src/lib/__tests__/utils.test.ts`:
```ts
describe('formatRupiah', () => {
  test('formats 150000 to "Rp 150.000"', ...)
  test('formats 0 to "Rp 0"', ...)
  test('formats 1500000 to "Rp 1.500.000"', ...)
  test('handles negative numbers', ...)
})

describe('generateOrderCode', () => {
  test('matches format ORD-YYYYMMDD-XXXX', ...)
  test('generates unique codes on successive calls', ...)
  test('date portion matches current date', ...)
})
```

Buat `src/types/__tests__/transitions.test.ts`:
```ts
describe('VALID_TRANSITIONS', () => {
  test('Menunggu Pembayaran → Menunggu Verifikasi, Dibatalkan', ...)
  test('Menunggu Verifikasi → Menunggu Pengiriman, Menunggu Pembayaran', ...)
  test('Menunggu Pengiriman → Dikirim, Dibatalkan', ...)
  test('Dikirim → Selesai, Dibatalkan', ...)
  test('Selesai → [] (final, no transitions)', ...)
  test('Dibatalkan → [] (final, no transitions)', ...)
})
```

### Acceptance Criteria:
- [ ] Seed berhasil, data masuk ke database
- [ ] `formatRupiah(150000)` → "Rp 150.000"
- [ ] `generateOrderCode()` → "ORD-20260406-XXXX"
- [ ] VALID_TRANSITIONS mapping lengkap sesuai PRD 12.8
- [ ] **Semua test PASS** (`npm run test`)
```

---

## Phase 2: Auth — NextAuth Configuration

### PRD Rules: A1, A2, A3, A4, A5, A6, A7

### Prompt:

```
Baca PRD.md Section 4.1, 4.2, 12.1 (Auth rules A1-A7) SELURUHNYA.
Baca skill vercel-react-best-practices.
Gunakan Context7 untuk fetch docs terbaru dari next-auth v5 (Auth.js).

Implementasikan konfigurasi NextAuth saja (belum UI):

1. **`src/lib/auth.ts`** — NextAuth v5 config:
   - Credentials provider (email + password)
   - Bcrypt compare untuk password verification
   - Callbacks: `jwt` callback → masukkan `id`, `role` ke token. `session` callback → expose `id`, `role` ke session.
   - Rule A4: Pesan error generik "Email atau password salah" (jangan bedakan email/password)
   - Pages config: signIn → "/login"

2. **`src/app/api/auth/[...nextauth]/route.ts`** — handler export GET, POST.

3. **`src/app/api/auth/register/route.ts`** — API register:
   - Validasi input dengan Zod: nama (min 2), email (valid format), phone (min 10 digit), password (min 8), address (min 5)
   - Rule A1: Cek email unik → 409 "Email sudah terdaftar"
   - Rule A2: Hash password bcrypt salt 10
   - Rule A3: Konfirmasi password cocok (validasi Zod refine)
   - Default role: 'user'
   - Return 201

4. **`src/middleware.ts`** — route protection:
   - `/cart`, `/checkout`, `/orders` → harus login (redirect `/login`)
   - `/admin/*` → harus login + role admin (redirect `/`)
   - Rule A6: Admin tidak bisa akses cart/checkout/orders
   - Rule A7: User yang sudah login tidak bisa akses `/login`, `/register`
   - Rule A5: Session expired → redirect `/login`

5. **Buat `src/lib/validations/auth.ts`:**
   - `registerSchema` — Zod schema reusable di client + server
   - `loginSchema` — Zod schema untuk login form

### Testing:

Buat `src/app/api/auth/__tests__/register.test.ts`:
```ts
// Gunakan Prisma test client atau mock Prisma
describe('POST /api/auth/register', () => {
  test('A1: rejects duplicate email with 409', ...)
  test('A2: stores hashed password (not plain text)', ...)
  test('A3: rejects mismatched passwords', ...)
  test('returns 201 on successful registration', ...)
  test('validates email format', ...)
  test('validates password minimum 8 chars', ...)
  test('validates phone minimum 10 digits', ...)
  test('sets default role to user', ...)
})
```

Buat `src/lib/validations/__tests__/auth.test.ts`:
```ts
describe('registerSchema', () => {
  test('rejects empty name', ...)
  test('rejects invalid email', ...)
  test('rejects short password', ...)
  test('rejects mismatched confirmPassword', ...)
  test('accepts valid input', ...)
})
```

### Acceptance Criteria:
- [ ] Register API: validasi jalan, password hashed, email duplikat ditolak
- [ ] Login via NextAuth credentials bekerja
- [ ] Session menyertakan id dan role
- [ ] Middleware proteksi route aktif
- [ ] Rule A4: Error message tidak bocorkan info
- [ ] Rule A6: Admin tidak bisa akses cart/checkout
- [ ] Rule A7: User login tidak bisa akses login/register
- [ ] **Semua test PASS**
```

---

## Phase 3: Auth — UI Login & Register (Pretty)

### PRD Rules: A1, A3, A4, A7

### UI Design Direction:
> Baca skill `frontend-design` SKILL.md.
> **Aesthetic:** Editorial/magazine — split-screen layout. Sisi kiri: ilustrasi/gambar dekoratif buku (gunakan gradient mesh atau abstract book illustration). Sisi kanan: form. JANGAN generic white card di tengah. Typography harus bold dan distinctive. Gunakan Google Fonts yang unik (misal: Playfair Display untuk heading, Source Sans Pro untuk body).

### Prompt:

```
Baca PRD.md Section 4.1, 4.2.
Baca skill shadcn SKILL.md — ikuti SEMUA critical rules (FieldGroup+Field, semantic colors, gap not space-y, data-icon, dll).
Baca skill frontend-design SKILL.md — desain HARUS distinctive dan memorable, BUKAN generic.

**UI DIRECTION:** Editorial/magazine split-screen.
- Sisi kiri (40-50%): Dekoratif — gradient mesh background, ilustrasi abstrak buku, atau pattern geometris yang eye-catching. Bisa pakai CSS art atau SVG abstract illustration. Tampilkan quote tentang buku / reading.
- Sisi kanan (50-60%): Form area — clean, spacious, typography premium.
- Mobile: Full-width form, dekoratif jadi header section.
- Font: Pilih 2 Google Fonts yang BUKAN Inter/Roboto/Arial. Satu display font untuk heading (bold, karakterful), satu body font.
- Color scheme: BUKAN purple-gradient-on-white. Pilih warm palette (cream/amber/terracotta) atau cool editorial (slate/teal/sage).

Install shadcn components:
`npx shadcn@latest add button input card separator spinner`
Jalankan `npx shadcn@latest docs button input card` untuk cek API & contoh penggunaan.

1. **Setup Google Fonts di `src/app/layout.tsx`:**
   - Import 2 font via `next/font/google`
   - Set CSS variables: `--font-display` dan `--font-body`
   - Apply di body dan heading classes

2. **`src/app/(public)/layout.tsx`** — layout dasar publik (minimal dulu, lengkap di Phase 4):
   - Slot children saja, belum perlu navbar/footer lengkap

3. **`src/app/(public)/register/page.tsx`:**
   - Split-screen layout (flex/grid)
   - Left panel: dekoratif (gradient mesh, SVG illustration, quote)
   - Right panel: form
   - Form fields: Nama, Email, No. Telepon, Alamat (textarea), Password, Konfirmasi Password
   - Gunakan shadcn components: Card, Input, Button, Spinner (untuk loading)
   - Gunakan FieldGroup + Field pattern dari shadcn skill (BUKAN raw div)
   - Client-side validation dengan Zod (reuse `registerSchema` dari Phase 2)
   - Error handling: error per field (FieldDescription + data-invalid) + error global (toast via sonner)
   - Rule A1: Tampilkan toast "Email sudah terdaftar" jika 409
   - Rule A3: Konfirmasi password mismatch → error di field
   - Sukses → redirect ke `/login` dengan toast "Registrasi berhasil"
   - Link ke halaman login di bawah form
   - Micro-animation: form fields fade-in staggered saat page load

4. **`src/app/(public)/login/page.tsx`:**
   - Desain konsisten dengan register (split-screen, font, color)
   - Form: Email, Password
   - Integrasi signIn() dari next-auth/react
   - Rule A4: Error toast "Email atau password salah" (generik!)
   - Sukses → redirect ke home
   - Link ke halaman register

5. **Install sonner:** `npx shadcn@latest add sonner`
   - Setup Toaster di root layout (theme sesuai color scheme)

6. **SessionProvider** wrapper di root layout `src/app/layout.tsx`

### Testing:

Buat `src/app/(public)/__tests__/register.test.tsx`:
```tsx
describe('Register Page', () => {
  test('renders all form fields', ...)
  test('shows validation errors for empty fields', ...)
  test('A3: shows error when passwords dont match', ...)
  test('A1: shows toast on duplicate email (409)', ...)
  test('redirects to login on success', ...)
  test('has link to login page', ...)
  test('disables submit button while loading', ...)
})
```

Buat `src/app/(public)/__tests__/login.test.tsx`:
```tsx
describe('Login Page', () => {
  test('renders email and password fields', ...)
  test('A4: shows generic error on failed login', ...)
  test('redirects to home on success', ...)
  test('has link to register page', ...)
  test('disables submit button while loading', ...)
})
```

### Acceptance Criteria:
- [ ] Split-screen layout: dekoratif kiri, form kanan
- [ ] Font BUKAN Inter/Roboto (distinctive Google Fonts)
- [ ] Color scheme cohesive (BUKAN purple-on-white)
- [ ] Register form: semua field tervalidasi, error tampil per field
- [ ] Micro-animation pada form load
- [ ] Register berhasil → redirect ke login + toast
- [ ] Login gagal → toast error generik (rule A4)
- [ ] Mengikuti shadcn patterns (FieldGroup, semantic colors, gap)
- [ ] **Semua test PASS**
```

---

## Phase 4: Layout Publik — Navbar & Footer (Pretty)

### PRD Rules: A5, A6, A7 (navbar state), C9 (cart badge)

### UI Design Direction:
> **Aesthetic:** Refined bookstore — navbar harus terasa seperti header majalah / toko buku premium. BUKAN generic boring nav. Gunakan font display untuk logo. Footer dengan character — bisa pakai pattern/texture background.

### Prompt:

```
Baca skill frontend-design SKILL.md — navbar & footer adalah FIRST IMPRESSION, harus premium.
Baca skill shadcn SKILL.md untuk component patterns.

Install shadcn components:
`npx shadcn@latest add avatar dropdown-menu badge sheet navigation-menu tooltip`

1. **`src/components/layout/navbar.tsx`:**
   - **Logo/brand:** Gunakan font display (dari Phase 3). Logo teks atau custom SVG. BUKAN generic text.
   - Navigasi: Home, Katalog Buku, About, Contact
   - Search bar: styled input with search icon (InputGroup pattern), bisa collapse/expand di desktop
   - Cart icon (Lucide ShoppingCart) dengan Badge jumlah item — hardcode 0 dulu
   - **Unauthenticated:** tombol Login (outline) / Register (filled) — styled dengan gap, bukan space-x
   - **Authenticated User:** Avatar + DropdownMenu — nama user, link "Pesanan Saya", Separator, Logout
   - **Authenticated Admin:** tambahkan link "Dashboard Admin" di dropdown, pakai Badge "Admin" kecil
   - Rule A6: Navbar aware — jika admin, jangan tampilkan cart icon
   - Responsive: Sheet (side panel) sebagai mobile menu — trigger button dengan hamburger icon
   - Gunakan `data-icon` pattern dari shadcn skill untuk semua icon di Button
   - **Scroll behavior:** Navbar sticky, subtle shadow/backdrop-blur on scroll
   - **Hover effects:** Link nav punya underline animation atau highlight effect

2. **`src/components/layout/footer.tsx`:**
   - Section: Logo + deskripsi singkat toko, Quick Links, Kontak
   - Background: warna gelap atau dengan subtle pattern/texture (BUKAN flat gray)
   - Copyright © 2026 USK BookStore
   - Desain cohesive dengan navbar dan overall theme

3. **Update `src/app/(public)/layout.tsx`:**
   - Include Navbar + Footer
   - Main content area: min-height agar footer selalu di bawah

4. **Buat `src/app/(user)/layout.tsx`:**
   - Reuse Navbar + Footer yang sama, halaman protected via middleware

### Testing:

Buat `src/components/layout/__tests__/navbar.test.tsx`:
```tsx
describe('Navbar', () => {
  test('renders logo and navigation links', ...)
  test('shows Login/Register buttons when unauthenticated', ...)
  test('shows avatar dropdown when authenticated', ...)
  test('A6: hides cart icon for admin users', ...)
  test('shows admin dashboard link for admin users', ...)
  test('renders search bar', ...)
  test('cart badge shows correct count', ...)
})
```

Buat `src/components/layout/__tests__/footer.test.tsx`:
```tsx
describe('Footer', () => {
  test('renders copyright text', ...)
  test('renders quick links', ...)
})
```

### Acceptance Criteria:
- [ ] Logo dengan font display (distinctive, memorable)
- [ ] Navbar sticky with blur effect on scroll
- [ ] Link hover animations
- [ ] Responsive (desktop: full nav, mobile: Sheet hamburger)
- [ ] Cart badge tampil (hardcode 0), hidden untuk admin (rule A6)
- [ ] User dropdown: nama, pesanan, logout
- [ ] Admin user: Badge "Admin" + link Dashboard di dropdown
- [ ] Footer dengan background texture/pattern (BUKAN flat)
- [ ] **Semua test PASS**
```

---

## Phase 5: Halaman Home (Pretty, Showpiece)

### PRD Rules: - (display only, no business logic mutations)

### UI Design Direction:
> Baca skill `frontend-design` SKILL.md dan skill `algorithmic-art` SKILL.md (`.agents/skills/algorithmic-art/SKILL.md`).
> **Aesthetic:** Hero section adalah SHOWPIECE. Gunakan:
> - Gradient mesh / animated gradient sebagai background hero (CSS animation atau canvas)
> - ATAU generative art pattern (dari algorithmic-art skill) sebagai dekoratif element — misalnya subtle particle flow, atau geometric pattern yang ber-animasi perlahan
> - Typography besar, bold, kontras tinggi
> - Staggered reveal animation saat scroll (IntersectionObserver atau CSS scroll-triggered)
> - Kategori cards dengan hover effect yang satisfying (scale + shadow transition)
> - Book cards dengan subtle hover lift effect

### Prompt:

```
Baca skill frontend-design SKILL.md untuk desain yang BOLD dan MEMORABLE.
Baca skill algorithmic-art SKILL.md — pertimbangkan untuk membuat decorative background element menggunakan CSS/SVG generative pattern (BUKAN p5.js canvas, tapi bisa ambil inspirasi dari filosofi generative art untuk pattern/gradient yang organik).
Baca skill vercel-react-best-practices SKILL.md — rules: server component first, parallel fetching.

Install shadcn components: `npx shadcn@latest add skeleton`

1. **`src/app/(public)/page.tsx`** (Server Component):
   - **Hero section — SHOWPIECE:**
     - Background: animated gradient mesh (CSS @keyframes), atau layered SVG abstract shapes
     - Headline besar: font display, size 3xl-5xl, bold. Contoh: "Temukan Dunia Baru di Setiap Halaman"
     - Subtitle: font body, muted color
     - CTA button: "Jelajahi Koleksi" → link ke /books. Styled with hover animation.
     - Optional: floating book illustrations (CSS transform animations, subtle)
   - **Section kategori:**
     - Heading: "Kategori Favorit" — font display
     - Grid card kategori (ambil dari DB) — setiap card: icon/emoji per kategori, nama, book count
     - Hover: scale(1.02) + shadow increase + subtle color shift
     - Masing-masing link ke /books?category={id}
   - **Section buku terbaru:**
     - Heading: "Baru Tersedia"
     - Grid 4 kolom (desktop), 2 tablet, 1 mobile
     - Reuse BookCard component
     - "Lihat Semua →" link ke /books
   - **Staggered reveal:** Tiap section muncul dengan fade-up animation saat scroll ke viewport
   - Data fetching: langsung dari Prisma (server component), parallel fetch dengan Promise.all

2. **`src/components/book-card.tsx`:**
   - Card: gambar cover (next/image, aspect-ratio 3/4), judul (truncate 2 lines), penulis (muted), harga (formatRupiah, bold)
   - Badge kategori di corner gambar
   - Hover: lift effect (translateY(-4px) + shadow)
   - Gunakan shadcn Card composition (CardHeader, CardContent, CardFooter)
   - Link wrapper ke /books/[id]

3. **Loading state:** Buat `src/app/(public)/loading.tsx` dengan Skeleton layout yang mirror halaman home

4. **`src/components/decorative/animated-gradient.tsx`:**
   - Reusable animated gradient background component (CSS-only)
   - Bisa dipakai di hero dan page lain

### Testing:

Buat `src/components/__tests__/book-card.test.tsx`:
```tsx
describe('BookCard', () => {
  test('renders book title, author, price', ...)
  test('formats price as Rupiah', ...)
  test('renders category badge', ...)
  test('links to correct book detail page', ...)
  test('uses next/image for cover', ...)
  test('truncates long titles', ...)
})
```

Buat `src/app/(public)/__tests__/home.test.tsx`:
```tsx
describe('Home Page', () => {
  test('renders hero section with CTA', ...)
  test('renders category cards from database', ...)
  test('renders latest books from database', ...)
  test('category cards link to /books?category=X', ...)
})
```

### Acceptance Criteria:
- [ ] Hero section: animated gradient/mesh background, typography besar bold
- [ ] CTA button dengan hover animation
- [ ] Staggered scroll-reveal animation per section
- [ ] Kategori cards dengan hover effect (scale + shadow)
- [ ] Book cards dengan lift effect dan proper formatting
- [ ] Gambar menggunakan next/image (optimized)
- [ ] Data fetching parallel (Promise.all)
- [ ] Loading skeleton yang mirror layout
- [ ] **Semua test PASS**
```

---

## Phase 6: Halaman Katalog Buku + Pencarian (Pretty)

### PRD Rules: C1 (max qty = stok), C4 (stok habis → disabled)

### UI Design Direction:
> Grid layout dengan filter sidebar (desktop) atau filter sheet (mobile). Card hover effects konsisten dengan home. Search bar prominently placed. Empty state kreatif — BUKAN boring "No results" text, gunakan ilustrasi atau empty state component yang engaging.

### Prompt:

```
Baca PRD.md Section 4.6 (Pencarian), 4.7 (Detail Buku).
Baca skill vercel-react-best-practices — rules: async-suspense-boundaries, rerender-use-deferred-value.
Baca skill shadcn SKILL.md.

Install shadcn components: `npx shadcn@latest add select pagination`

1. **`src/app/api/books/route.ts`** — GET:
   - Query params: `search` (judul/penulis), `category` (category_id), `page` (default 1), `limit` (default 12)
   - Return: { books, totalPages, currentPage }
   - Search: WHERE title LIKE %search% OR author LIKE %search%
   - Filter: WHERE category_id = category (jika ada)
   - Pagination: skip + take

2. **`src/app/api/books/[id]/route.ts`** — GET:
   - Return buku + include category
   - 404 jika tidak ditemukan

3. **`src/app/api/categories/route.ts`** — GET:
   - Return semua kategori

4. **`src/app/(public)/books/page.tsx`:**
   - **Search bar:** Prominently placed di atas, full-width, styled, dengan icon
   - Gunakan URL searchParams (BUKAN local state — biar URL shareable)
   - **Filter:** Desktop → sidebar dengan Select dropdown kategori. Mobile → Sheet/Collapsible.
   - Grid buku (reuse BookCard component)
   - Pagination di bawah (shadcn Pagination) — styled, clear active page
   - **Empty state:** Gunakan shadcn Empty component — ilustrasi + teks "Buku yang kamu cari belum tersedia" + link kembali
   - Gunakan Suspense boundary + loading Skeleton

5. **`src/app/(public)/books/[id]/page.tsx`** — Detail Buku:
   - **Layout:** 2-column — gambar besar kiri (next/image, aspect-ratio, rounded-lg, shadow), info kanan
   - Judul (font display, large), penulis, penerbit, tahun, kategori (Badge), deskripsi
   - **Harga:** Large, bold, warna accent
   - **Stok:** Badge — hijau "Tersedia (X)" atau merah "Stok Habis"
   - **Quantity selector:** Styled number input with −/+ buttons (shadcn Button), min 1, max = stock
   - Rule C4: Jika stok = 0 → tombol "Add to Cart" disabled (variant destructive/secondary) + "Stok Habis" Badge
   - Rule C1: Max quantity = stok, tombol + disabled saat max
   - Tombol "Add to Cart" (belum fungsional, fungsionalnya di Phase 9) — icon ShoppingCart dengan data-icon
   - Mobile: gambar full-width di atas, info di bawah

### Testing:

Buat `src/app/api/books/__tests__/route.test.ts`:
```ts
describe('GET /api/books', () => {
  test('returns paginated books', ...)
  test('search filters by title', ...)
  test('search filters by author', ...)
  test('filter by category_id', ...)
  test('returns empty array when no match', ...)
  test('default page=1, limit=12', ...)
})

describe('GET /api/books/[id]', () => {
  test('returns book with category', ...)
  test('returns 404 for non-existent book', ...)
})
```

Buat `src/app/(public)/books/__tests__/detail.test.tsx`:
```tsx
describe('Book Detail Page', () => {
  test('C4: disables Add to Cart when stock is 0', ...)
  test('C4: shows "Stok Habis" badge when stock is 0', ...)
  test('C1: quantity max equals book stock', ...)
  test('C1: plus button disabled at max quantity', ...)
  test('renders price in Rupiah format', ...)
  test('renders book info: title, author, publisher, year', ...)
})
```

### Acceptance Criteria:
- [ ] Search by judul/penulis bekerja via URL params
- [ ] Filter kategori bekerja
- [ ] Pagination bekerja, active page visible
- [ ] URL shareable (semua state di searchParams)
- [ ] Detail buku: 2-column layout, pretty
- [ ] Stok habis → tombol disabled + badge merah (rule C4)
- [ ] Quantity max = stok, +/- styled (rule C1)
- [ ] Empty state dengan ilustrasi (BUKAN boring text)
- [ ] **Semua test PASS**
```

---

## Phase 7: Halaman About & Contact (Pretty)

### PRD Rules: - (static pages, no business logic)

### UI Design Direction:
> **About:** Magazine editorial style. Sections dengan alternating layouts. Bisa pakai large typography, pull-quotes, decorative dividers. Timeline atau grid untuk visi/misi.
> **Contact:** Clean form dengan decorative element. WhatsApp icon prominent. Map illustration atau decorative background.

### Prompt:

```
Baca PRD.md Section 4.4 (About), 4.5 (Contact WhatsApp).
Baca skill frontend-design SKILL.md — SETIAP halaman harus punya character sendiri.

Install shadcn components: `npx shadcn@latest add textarea` (jika belum)

1. **`src/app/(public)/about/page.tsx`:**
   - **Hero mini:** Heading besar "Tentang Kami" + subtitle, background gradient/pattern
   - **Section toko:** Deskripsi dengan typography yang readable, bisa pakai Card atau styled section
   - **Section Visi & Misi:** Grid 2 kolom, masing-masing dengan icon dekoratif, heading bold
   - **Decorative:** Separator custom (bukan plain hr), subtle scroll-reveal animation
   - Desain menarik, multiple sections dengan variasi layout

2. **`src/app/(public)/contact/page.tsx`:**
   - **Layout:** 2-column. Kiri: info kontak (alamat, jam operasional, WhatsApp number). Kanan: form.
   - **Form:** Nama, Subjek, Isi Pesan (Textarea)
   - Gunakan shadcn FieldGroup + Field pattern (BUKAN raw div)
   - Tombol "Kirim via WhatsApp" — Button variant default, icon WhatsApp (SVG custom atau Lucide MessageCircle) dengan data-icon
   - Client-side only: saat submit, buka `https://wa.me/{NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER}?text={encoded}` di tab baru
   - Format pesan: `Halo, saya *{nama}*.\n\nSubjek: *{subjek}*\n\n{pesan}`
   - Validasi: semua field wajib diisi (Zod client-side)
   - TIDAK ada API call, TIDAK simpan ke database
   - **Decorative:** Background pattern atau gradient di section info kontak
   - Mobile: stack vertikal

### Testing:

Buat `src/app/(public)/__tests__/contact.test.tsx`:
```tsx
describe('Contact Page', () => {
  test('renders form with Nama, Subjek, Pesan fields', ...)
  test('validates all fields required', ...)
  test('generates correct WhatsApp URL with encoded message', ...)
  test('opens WhatsApp link in new tab on submit', ...)
  test('formats message correctly: "Halo, saya *{nama}*..."', ...)
  test('does NOT make any API call', ...)
  test('uses correct phone number from env', ...)
})
```

Buat `src/app/(public)/__tests__/about.test.tsx`:
```tsx
describe('About Page', () => {
  test('renders visi and misi sections', ...)
  test('renders store description', ...)
})
```

### Acceptance Criteria:
- [ ] About: multiple sections, editorial style, decorative elements
- [ ] Contact: 2-column layout, form + info
- [ ] WhatsApp redirect dengan pesan terformat (URL encoded)
- [ ] URL WhatsApp benar (wa.me, bukan api.whatsapp)
- [ ] Validasi form (field wajib)
- [ ] BUKAN generic halaman — setiap punya character
- [ ] **Semua test PASS**
```

---

## Phase 8: Cart — API & Logic

### PRD Rules: C1, C2, C3, C4, C5, C6, C7, C8, C9 (SEMUA cart rules)

### Prompt:

```
Baca PRD.md Section 4.8, 12.3 (Cart rules C1-C9) dengan TELITI. SEMUA 9 rules harus diimplementasi.

Implementasikan HANYA API cart (UI di Phase 9):

1. **`src/app/api/cart/route.ts`** — GET:
   - Rule C7: Cek session (401 jika tidak login)
   - Ambil semua cart items user + JOIN ke books
   - Rule C6: Filter out item yang book-nya sudah null/dihapus. Return `removedItems: string[]`
   - Rule C5: Cek setiap item. Jika `cart.quantity > book.stock` → set quantity = book.stock (hapus jika stok = 0). Return `adjustedItems: {title, oldQty, newQty}[]`
   - Rule C8: Hitung total_price = quantity × current book.price, update di DB
   - Return: { items, removedItems, adjustedItems, totalAmount }

2. **`src/app/api/cart/route.ts`** — POST (tambah item):
   - Body: { bookId, quantity }
   - Rule C7: Cek session (401)
   - Ambil book dari DB, cek exists
   - Rule C4: Cek book.stock > 0 (tolak jika habis) → 400 "Stok habis"
   - Rule C3: Cek apakah buku sudah ada di cart user → increment, BUKAN buat row baru
   - Rule C1: total quantity (existing + tambahan) ≤ book.stock → 400 "Stok tersedia hanya {stock}. Anda sudah memiliki {existing} di keranjang."

3. **`src/app/api/cart/[id]/route.ts`** — PUT:
   - Body: { quantity }
   - Cek ownership (cart milik user session)
   - Rule C1: quantity ≤ book.stock
   - Rule C2: quantity ≤ 0 → hapus item. Tidak boleh negatif.
   - Rule C8: Update total_price = quantity × book.price

4. **`src/app/api/cart/[id]/route.ts`** — DELETE:
   - Cek ownership
   - Hapus cart item

### Testing:

Buat `src/app/api/cart/__tests__/route.test.ts`:
```ts
describe('POST /api/cart', () => {
  test('C7: returns 401 when not logged in', ...)
  test('C4: returns 400 when book stock is 0', ...)
  test('C3: increments quantity when book already in cart', ...)
  test('C3: creates new cart item when book not in cart', ...)
  test('C1: returns 400 when quantity exceeds stock', ...)
  test('C1: error message includes stock and existing qty', ...)
  test('returns 404 when book doesnt exist', ...)
})

describe('PUT /api/cart/[id]', () => {
  test('C1: returns 400 when quantity exceeds stock', ...)
  test('C2: deletes item when quantity is 0', ...)
  test('C2: rejects negative quantity', ...)
  test('C8: updates total_price = qty * book.price', ...)
  test('rejects update for other users cart (ownership)', ...)
})

describe('DELETE /api/cart/[id]', () => {
  test('deletes cart item', ...)
  test('rejects delete for other users cart (ownership)', ...)
})

describe('GET /api/cart', () => {
  test('C7: returns 401 when not logged in', ...)
  test('C6: removes items where book was deleted, returns removedItems', ...)
  test('C5: adjusts quantity when stock decreased, returns adjustedItems', ...)
  test('C5: removes item when stock is 0', ...)
  test('C8: total_price uses current book.price', ...)
  test('C9: returns empty items when cart is empty', ...)
})
```

### Acceptance Criteria:
- [ ] C1: Quantity ≤ stok — validated server-side
- [ ] C2: Quantity 0 → delete, negatif → reject
- [ ] C3: Duplikat → increment, bukan row baru
- [ ] C4: Stok 0 → tolak
- [ ] C5: Stok berkurang → auto-adjust + info
- [ ] C6: Buku dihapus → auto-remove + info
- [ ] C7: Harus login
- [ ] C8: total_price dihitung dari harga terkini
- [ ] C9: Cart kosong → empty response
- [ ] Ownership check: user hanya akses cart sendiri
- [ ] **Semua test PASS — SEMUA 9 rules tercakup**
```

---

## Phase 9: Cart — UI Halaman (Pretty)

### PRD Rules: C1, C2, C5, C6, C9

### UI Design Direction:
> Cart page harus feel premium. Thumbnail buku bagus. Quantity controls styled. Total area prominent. Empty cart state kreatif — bukan cuma teks, pakai ilustrasi. Warning alerts styled dan informatif.

### Prompt:

```
Baca PRD.md Section 4.8, 12.3.
Baca skill shadcn SKILL.md.
Baca skill frontend-design SKILL.md.

Install shadcn components: `npx shadcn@latest add table alert-dialog alert`

1. **`src/app/(user)/cart/page.tsx`:**
   - Fetch cart dari GET `/api/cart`
   - **Warnings area:** Jika ada removedItems atau adjustedItems → shadcn Alert (variant destructive untuk removed, variant default/warning untuk adjusted). Pesan detail per item.
   - **Cart items:** Styled list/table
     - Gambar thumbnail (rounded, shadow), judul buku (font medium), harga satuan (formatRupiah, muted)
     - Quantity controls: styled −/+ buttons (shadcn Button size sm, variant outline) + angka di tengah
     - Rule C1: Tombol + disabled jika quantity = stok
     - Subtotal per item (bold)
     - Tombol hapus: icon Trash2 + AlertDialog konfirmasi "Hapus dari keranjang?"
   - **Total section:** Sticky bottom bar atau card di bawah — total keseluruhan (large, bold), tombol "Checkout" (full-width, prominent)
   - Rule C9: Empty state → shadcn Empty component dengan ilustrasi + "Keranjang kosong" + "Mulai Belanja →" link ke /books. Tombol checkout hidden.
   - Loading: Skeleton matching layout

2. **Fungsionalkan tombol "Add to Cart" di halaman detail buku** (Phase 6):
   - POST ke `/api/cart`, loading state (Spinner inside Button + disabled)
   - Toast sukses: "Berhasil ditambahkan ke keranjang" (sonner, icon check)
   - Toast error: tampilkan pesan dari API (dinamis)
   - Setelah add → refresh cart count di navbar

3. **Update Navbar cart badge:**
   - Buat `src/hooks/use-cart.ts` — custom hook atau React Context:
     - `cartCount`, `refreshCart()`
   - Badge update setelah add/remove
   - Animated badge (scale pop saat count berubah)

### Testing:

Buat `src/app/(user)/cart/__tests__/page.test.tsx`:
```tsx
describe('Cart Page', () => {
  test('C9: shows empty state when cart is empty', ...)
  test('C9: hides checkout button when cart is empty', ...)
  test('renders cart items with thumbnail, title, price, qty', ...)
  test('C1: disables + button when qty equals stock', ...)
  test('C5: shows warning alert for adjusted items', ...)
  test('C6: shows destructive alert for removed items', ...)
  test('shows confirmation dialog before deleting item', ...)
  test('displays correct total amount', ...)
})
```

Buat `src/hooks/__tests__/use-cart.test.ts`:
```ts
describe('useCart', () => {
  test('returns cart count', ...)
  test('refreshCart updates count', ...)
})
```

### Acceptance Criteria:
- [ ] Cart items: thumbnail, title, qty controls, subtotal, hapus
- [ ] Quantity +/- styled, max = stok (rule C1)
- [ ] Empty state dengan ilustrasi (rule C9)
- [ ] Warning alerts untuk adjusted/removed items (rules C5, C6)
- [ ] Add to Cart: toast + badge animated update
- [ ] Delete: AlertDialog konfirmasi
- [ ] Total section prominent
- [ ] **Semua test PASS**
```

---

## Phase 10: Checkout — API (KRITIS)

### PRD Rules: C9, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, E1, F1, G1, J1, J4 (MASSIVE)

### Prompt:

```
Baca PRD.md Section 12.4 (D1-D10), 12.5 (E1-E2), 12.6 (F1), 12.7 (G1), 12.8 (Status Transition), 12.9 (Stok Lifecycle), 12.12 (J1, J4) SANGAT TELITI. Ini bagian PALING KRITIS.

1. **`src/app/api/orders/route.ts`** — POST (checkout):
   SEMUA dalam **1 DATABASE TRANSACTION** (rule J1):

   a. Cek session (401)
   b. Validasi input Zod: shipping_address (wajib, rule D4), payment_method ("COD"/"TRANSFER"/"MIDTRANS")
   c. Ambil cart items user + JOIN books. Rule C9: cart kosong → 400
   d. Rule D1: **Untuk setiap item, cek book.stock >= cart.quantity.**
      Jika ada yang tidak cukup → ROLLBACK, return 400 + detail item bermasalah
   e. Generate order_code (rule D9) — gunakan generateOrderCode() dari utils
   f. Tentukan status awal:
      - COD → "Menunggu Pengiriman" (rule E1)
      - Transfer → "Menunggu Pembayaran" (rule F1)
      - Midtrans → "Menunggu Pembayaran" (rule G1)
   g. Buat record orders
   h. Buat records order_details per item:
      - price = book.price SAAT INI (rule D5, snapshot)
      - subtotal = quantity × price (rule D6, hitung server)
   i. total_payment = SUM(subtotal) (rule D7, hitung server)
   j. Rule J4: JANGAN pernah ambil harga dari frontend/client
   k. Rule D2: Kurangi books.stock per item (`UPDATE books SET stock = stock - quantity`)
   l. Rule D8: Hapus semua cart items user
   m. COMMIT
   n. Return order data + order_code

   **Race condition** (rule D3, J1): gunakan Prisma interactive transaction.

2. **`src/app/api/orders/route.ts`** — GET:
   - Rule D10: Return hanya pesanan milik user session
   - Include order_details + book info
   - Sort by created_at DESC

3. **`src/app/api/orders/[id]/route.ts`** — GET:
   - Rule D10: Cek ownership. User A tidak bisa akses order user B → 403.
   - Return order + order_details + books

### Testing:

Buat `src/app/api/orders/__tests__/checkout.test.ts`:
```ts
describe('POST /api/orders (Checkout)', () => {
  // CORE TRANSACTION
  test('J1: all operations in single transaction — partial failure rolls back', ...)
  test('D1: rejects checkout when stock insufficient', ...)
  test('D1: returns detail of which items have insufficient stock', ...)
  test('D2: decrements book stock after checkout', ...)
  test('D8: clears cart after successful checkout', ...)

  // PRICE INTEGRITY
  test('D5: order_details.price is snapshot of current book.price', ...)
  test('D6: subtotal = quantity * price (calculated server-side)', ...)
  test('D7: total_payment = SUM of all subtotals', ...)
  test('J4: ignores price sent from client', ...)

  // STATUS MAPPING
  test('E1: COD → status "Menunggu Pengiriman"', ...)
  test('F1: TRANSFER → status "Menunggu Pembayaran"', ...)
  test('G1: MIDTRANS → status "Menunggu Pembayaran"', ...)

  // VALIDATION
  test('D4: rejects empty shipping_address', ...)
  test('D9: generates unique order_code', ...)
  test('C9: rejects checkout with empty cart', ...)
  test('returns 401 when not logged in', ...)

  // RACE CONDITION
  test('D3: concurrent checkout for last stock — only one succeeds', ...)
})

describe('GET /api/orders', () => {
  test('D10: returns only orders belonging to current user', ...)
})

describe('GET /api/orders/[id]', () => {
  test('D10: returns 403 for other users order', ...)
  test('returns order with details and book info', ...)
})
```

### Acceptance Criteria:
- [ ] Checkout dalam 1 transaction — gagal di tengah = rollback semua (J1)
- [ ] Stok di-recheck (D1). Stok tidak cukup → error + detail items
- [ ] Stok dikurangi (D2)
- [ ] Harga di-snapshot di order_details (D5)
- [ ] subtotal & total_payment dihitung server (D6, D7, J4)
- [ ] Cart kosong setelah checkout (D8)
- [ ] order_code unique (D9)
- [ ] Status awal sesuai metode pembayaran (E1, F1, G1)
- [ ] User hanya bisa lihat pesanannya (D10)
- [ ] Race condition: 2 user → hanya 1 berhasil (D3)
- [ ] **Semua test PASS — 17+ test cases**
```

---

## Phase 11: Checkout — UI (Pretty)

### PRD Rules: D4, E1, F1, G1

### UI Design Direction:
> Checkout harus feel trust-worthy dan clear. Order summary styled seperti invoice. Payment method selection visual (icon per method). Alamat pre-filled. Loading state meyakinkan user bahwa proses berjalan.

### Prompt:

```
Baca PRD.md Section 4.9.
Baca skill shadcn SKILL.md.
Baca skill frontend-design SKILL.md — checkout harus trust-worthy, clean, clear.

Install shadcn components: `npx shadcn@latest add radio-group textarea`

1. **`src/app/(user)/checkout/page.tsx`:**
   - Ambil cart items (jika kosong → redirect ke /cart)
   - **Order summary card:** Styled seperti invoice/receipt
     - Per item: thumbnail mini, judul, qty × harga, subtotal
     - Separator between items
     - Total pembayaran: large, bold, di bawah — styled prominent
   - **Form alamat pengiriman:**
     - Textarea, pre-fill dari user.address (rule D4: wajib)
     - Label + FieldGroup + Field pattern
   - **Pilih metode pembayaran:** RadioGroup VISUAL
     - Setiap option: icon + label + deskripsi singkat
     - COD: icon Truck, "Bayar saat terima"
     - Transfer Bank: icon Building2, "Transfer manual ke rekening toko"
     - Midtrans: icon CreditCard, "GoPay, OVO, VA, Kartu Kredit"
     - Selected state: border accent + background subtle
   - **Tombol "Konfirmasi Pesanan"** → POST `/api/orders`
     - Loading: Spinner + "Memproses pesanan..." + disabled
   - **Error handling:** Alert detail jika stok bermasalah + link "Kembali ke Keranjang"
   - **Sukses:**
     - COD/Transfer → redirect ke `/orders/{id}` dengan toast "Pesanan berhasil dibuat!"
     - Midtrans → trigger Midtrans Snap (Phase 14)

2. **`src/components/order-status-badge.tsx`:**
   - Reusable Badge per status:
     - Menunggu Pembayaran: amber/warning variant
     - Menunggu Verifikasi: blue
     - Menunggu Pengiriman: purple/indigo
     - Dikirim: cyan/sky
     - Selesai: green/success
     - Dibatalkan: red/destructive
   - Icon kecil per status (Lucide: Clock, Eye, Package, Truck, CheckCircle, XCircle)

### Testing:

Buat `src/app/(user)/checkout/__tests__/page.test.tsx`:
```tsx
describe('Checkout Page', () => {
  test('renders order summary with correct items', ...)
  test('D4: pre-fills shipping address from user profile', ...)
  test('D4: shows validation error when address is empty', ...)
  test('renders 3 payment methods: COD, Transfer, Midtrans', ...)
  test('E1/F1/G1: redirects to order detail on COD/Transfer success', ...)
  test('shows Alert with details when stock error', ...)
  test('disables button and shows spinner while processing', ...)
  test('redirects to /cart when cart is empty', ...)
})
```

Buat `src/components/__tests__/order-status-badge.test.tsx`:
```tsx
describe('OrderStatusBadge', () => {
  test('renders correct variant for each status', ...)
  test('renders correct icon for each status', ...)
  test('all 6 statuses are covered', ...)
})
```

### Acceptance Criteria:
- [ ] Order summary styled seperti invoice/receipt
- [ ] Payment methods: visual RadioGroup dengan icon + deskripsi
- [ ] Alamat pre-filled, editable, validated (D4)
- [ ] Submit: loading state dengan spinner + text
- [ ] Error stok: Alert + link ke cart
- [ ] Status badge: 6 variants dengan icon
- [ ] **Semua test PASS**
```

---

## Phase 12: Riwayat & Detail Pesanan User (Pretty)

### PRD Rules: D10 (ownership only)

### UI Design Direction:
> Order list: Card-based, not boring table. Setiap card feel like a mini receipt. Timeline/stepper untuk status progress. Detail pesanan: clean layout dengan clear sections.

### Prompt:

```
Baca PRD.md Section 4.10.
Baca skill frontend-design SKILL.md.

Install shadcn components: `npx shadcn@latest add tabs`

1. **`src/app/(user)/orders/page.tsx`:**
   - **List pesanan:** Card per pesanan (BUKAN table)
     - Card: order_code (monospace font), tanggal (formatted), status badge, total (formatRupiah, bold)
     - Metode bayar: small Badge/text
     - Klik card → /orders/[id]
     - Hover effect pada card
   - **Empty state:** shadcn Empty — ilustrasi + "Belum ada pesanan" + "Mulai Belanja →" link
   - Pagination jika banyak
   - Optional: filter tabs by status (Tabs component)

2. **`src/app/(user)/orders/[id]/page.tsx`:**
   - **Header section:** order_code (large, monospace), tanggal, status badge (large)
   - **Status timeline/stepper:** Visual progress indicator showing current status position
     - Steps: Pembayaran → Verifikasi → Pengiriman → Dikirim → Selesai
     - Completed steps: filled/colored, current: pulse/active, future: muted
     - If dibatalkan: show X mark
   - **Payment info card:** Metode, status pembayaran
   - **Shipping info card:** Alamat pengiriman, nomor resi (jika ada — with copy button)
   - **Order items table:** judul buku, qty, harga, subtotal — styled dengan Separator
   - **Total pembayaran:** Prominent, bottom of table
   - **Conditional sections (placeholder, fungsional di Phase 13 & 14):**
     - Transfer + "Menunggu Pembayaran"/"Menunggu Verifikasi" → area upload bukti
     - Midtrans + "Menunggu Pembayaran" → tombol "Bayar Sekarang"

### Testing:

Buat `src/app/(user)/orders/__tests__/page.test.tsx`:
```tsx
describe('Orders List Page', () => {
  test('renders order cards with order_code, date, status, total', ...)
  test('shows empty state when no orders', ...)
  test('cards link to order detail', ...)
  test('D10: only shows orders belonging to current user', ...)
})
```

Buat `src/app/(user)/orders/__tests__/detail.test.tsx`:
```tsx
describe('Order Detail Page', () => {
  test('renders order header with code and status', ...)
  test('renders status timeline/stepper', ...)
  test('renders order items table with correct data', ...)
  test('shows resi with copy button when available', ...)
  test('shows upload area for transfer orders awaiting payment', ...)
  test('shows "Bayar Sekarang" for midtrans orders awaiting payment', ...)
  test('D10: returns error for other users order', ...)
})
```

### Acceptance Criteria:
- [ ] Order cards: mini-receipt style, hover effect
- [ ] Status timeline/stepper visual progression
- [ ] Detail: clean sections, resi copy button
- [ ] Empty state dengan ilustrasi
- [ ] Conditional sections render correctly
- [ ] **Semua test PASS**
```

---

## Phase 13: Upload Bukti Transfer (Pretty)

### PRD Rules: F1, F2, F3, F4, F5, F6, F7, H1, H2, H3, H4, H5, H6, H7 (16 rules!)

### UI Design Direction:
> Upload area harus terasa mudah dan trust-worthy. Drag-and-drop zone styled. Preview gambar clear. Progress indicator smooth. Re-upload option jelas.

### Prompt:

```
Baca PRD.md Section 12.6 (Transfer rules F1-F7), 12.10 (Upload & Compression rules H1-H7).
Gunakan Context7 untuk fetch docs browser-image-compression.
Baca skill shadcn SKILL.md.

1. **`src/lib/image-compression.ts`:**
   - `compressImage(file: File): Promise<File>` — browser-image-compression
   - Config: maxSizeMB=1, maxWidthOrHeight=1920, useWebWorker=true (rule H2)
   - Rule H3: Setelah compress, jika masih > 2MB → throw error "Gambar terlalu besar"

2. **`src/app/api/orders/[id]/upload-proof/route.ts`** — POST:
   - Cek session + ownership (order milik user)
   - Rule F2: Status harus "Menunggu Pembayaran" atau "Menunggu Verifikasi" (rule F4)
   - Rule H1: Validasi tipe file (JPG, JPEG, PNG)
   - Rule H4: Validasi MIME type via file buffer (bukan hanya extension)
   - H4 server safety net: max 5MB
   - Rule H5: Rename ke `{uuid}.{ext}`
   - Rule H7: Simpan ke `public/uploads/proofs/`
   - Rule H6: Hapus file lama jika re-upload
   - Rule F5: Update order status → "Menunggu Verifikasi"

3. **Upload UI di `src/app/(user)/orders/[id]/page.tsx`:**
   - Tampilkan HANYA jika: payment_method = "TRANSFER" dan status tepat (F2/F4)
   - **Styled upload zone:**
     - Dashed border area, icon Upload
     - Drag-and-drop support (HTML5 drag events)
     - Atau klik untuk pilih file
     - Accepted: JPG, PNG
   - **Client-side flow:**
     - Pilih file → compress (rule H2) → show preview
     - Progress: "Mengompres..." → "Mengunggah..." → "Berhasil!"
     - Jika compress gagal (H3) → toast error
   - **Preview:** Gambar ter-compress ditampilkan sebelum upload
   - **Jika sudah ada bukti:** Tampilkan gambar bukti saat ini + tombol "Upload Ulang" (rule F4)
   - **After upload:** Status berubah, toast sukses

4. **Buat folder** `public/uploads/proofs/` dan `public/uploads/books/`
5. **Tambah** `public/uploads/` ke `.gitignore`

### Testing:

Buat `src/lib/__tests__/image-compression.test.ts`:
```ts
describe('compressImage', () => {
  test('H2: compresses image to target <= 1MB', ...)
  test('H3: throws error when compressed still > 2MB', ...)
  test('returns File object', ...)
})
```

Buat `src/app/api/orders/__tests__/upload-proof.test.ts`:
```ts
describe('POST /api/orders/[id]/upload-proof', () => {
  test('F2: rejects upload when status not "Menunggu Pembayaran"', ...)
  test('F4: allows upload when status "Menunggu Verifikasi" (re-upload)', ...)
  test('F5: changes status to "Menunggu Verifikasi"', ...)
  test('H1: rejects non-image files (PDF, etc)', ...)
  test('H4: validates MIME type, not just extension', ...)
  test('H5: renames file to UUID', ...)
  test('H6: deletes old file on re-upload', ...)
  test('rejects upload for other users order (ownership)', ...)
  test('rejects when session invalid (401)', ...)
})
```

### Acceptance Criteria:
- [ ] Upload zone: styled dashed border, drag-and-drop
- [ ] H2: Client-side compression (target ≤ 1MB)
- [ ] H3: Error jika masih > 2MB setelah compress
- [ ] H4: Server MIME type validation
- [ ] H5: UUID rename, H6: old file deleted
- [ ] F2/F4: Upload hanya saat status tepat
- [ ] F5: Status → "Menunggu Verifikasi"
- [ ] Preview gambar + re-upload option
- [ ] Progress states: compressing → uploading → done
- [ ] **Semua test PASS — semua 16 rules tercakup**
```

---

## Phase 14: Integrasi Midtrans Snap

### PRD Rules: G1, G2, G3, G4, G5, G6, J2

### Prompt:

```
Baca PRD.md Section 9 (Integrasi Midtrans), 12.7 (Midtrans rules G1-G6), 12.12 (J2).
Gunakan Context7 untuk fetch docs midtrans-client.

1. **`src/lib/midtrans.ts`:**
   - Setup Snap client (server key, isProduction dari env)
   - `createTransaction(order, orderDetails, user)`:
     - Parameter: order_id = order.order_code, gross_amount = order.total_payment
     - Item details dari order_details
     - Customer details (nama, email, phone)
     - Return snap token
   - `verifySignature(notification)` — verifikasi signature key webhook

2. **`src/app/api/payment/midtrans/route.ts`** — POST:
   - Body: { orderId }
   - Rule G2: Validasi payment_method = "MIDTRANS" dan status = "Menunggu Pembayaran"
   - Generate snap token
   - Return { token }

3. **`src/app/api/payment/midtrans/callback/route.ts`** — POST (webhook):
   - Rule G3: Verifikasi signature. Reject (403) jika tidak valid
   - Rule G4: Idempotent — cek status current sebelum update
   - Rule G5 mapping:
     - settlement/capture → "Menunggu Pengiriman"
     - pending → tetap "Menunggu Pembayaran"
     - deny/cancel/expire → "Dibatalkan" + **kembalikan stok** (transaction, rule J2)
   - Return 200 OK

4. **Frontend Snap di checkout page:**
   - Load script: `https://app.sandbox.midtrans.com/snap/snap.js`
   - Setelah order dibuat → API → token → `window.snap.pay(token)`
   - Handle callbacks: close → redirect ke order detail

5. **Tombol "Bayar Sekarang" di detail pesanan:**
   - Jika status "Menunggu Pembayaran" + metode Midtrans → generate token ulang → snap.pay()
   - Styled: prominent Button, icon CreditCard

### Testing:

Buat `src/lib/__tests__/midtrans.test.ts`:
```ts
describe('verifySignature', () => {
  test('G3: returns true for valid signature', ...)
  test('G3: returns false for invalid signature', ...)
})
```

Buat `src/app/api/payment/__tests__/midtrans.test.ts`:
```ts
describe('POST /api/payment/midtrans', () => {
  test('G2: rejects non-MIDTRANS payment method', ...)
  test('G2: rejects order not in "Menunggu Pembayaran" status', ...)
  test('returns snap token on success', ...)
})

describe('POST /api/payment/midtrans/callback', () => {
  test('G3: rejects invalid signature with 403', ...)
  test('G4: idempotent — skips if status already updated', ...)
  test('G5: settlement → "Menunggu Pengiriman"', ...)
  test('G5: pending → stays "Menunggu Pembayaran"', ...)
  test('G5: deny/cancel → "Dibatalkan" + stock restored', ...)
  test('G5+J2: expire → "Dibatalkan" + stock restored in transaction', ...)
  test('returns 200 OK on all valid notifications', ...)
})
```

### Acceptance Criteria:
- [ ] Snap popup muncul setelah checkout Midtrans
- [ ] G3: Webhook verifikasi signature
- [ ] G4: Webhook idempotent
- [ ] G5: Status mapping benar (settlement, cancel, expire)
- [ ] G5+J2: Cancel/expire → stok dikembalikan (transaction)
- [ ] "Bayar Sekarang" retry dari detail pesanan
- [ ] **Semua test PASS**
```

---

## Phase 15: Admin — Layout & Dashboard (Pretty)

### PRD Rules: I3 (pendapatan hanya Selesai), I4 (pagination)

### UI Design Direction:
> Admin panel: clean, professional, data-focused. Dark sidebar (contrast dengan content area). Dashboard cards dengan subtle gradient/shadow. Chart untuk statistik. HARUS terasa BERBEDA dari storefront publik.

### Prompt:

```
Baca PRD.md Section 5.1.
Baca skill frontend-design SKILL.md — admin BERBEDA dari public, professional, data-focused.
Baca skill shadcn SKILL.md.

Install shadcn components: `npx shadcn@latest add sidebar chart tooltip breadcrumb`

1. **`src/app/admin/layout.tsx`:**
   - **Sidebar:** shadcn Sidebar component
     - Dark background (slate-900 atau zinc-900)
     - Logo toko (kecil)
     - Nav items: Dashboard, Kategori, Buku, Users, Pesanan — dengan Lucide icons, data-icon pattern
     - Active state: bg accent
     - Responsive: collapse di mobile, toggle button
   - **Header:** Breadcrumb, nama admin (Avatar kecil), tombol logout
   - **Content area:** Light background, padded, max-width

2. **`src/app/admin/page.tsx`** (Dashboard):
   - **Stat cards** (grid 4 col): Total Buku, Total User, Total Pesanan, Pendapatan
     - Setiap card: icon, label, angka besar (bold), subtle background gradient
     - Rule I3: Pendapatan = SUM(total_payment) dari pesanan status "Selesai" SAJA
   - **Chart:** Area chart atau Bar chart (shadcn Chart) — pesanan per minggu/bulan
   - **Tabel pesanan terbaru** (5 terakhir): order_code, user, status badge, total
   - Data: server component, langsung dari Prisma

### Testing:

Buat `src/app/admin/__tests__/dashboard.test.tsx`:
```tsx
describe('Admin Dashboard', () => {
  test('I3: revenue only counts orders with status "Selesai"', ...)
  test('displays correct total books count', ...)
  test('displays correct total users count', ...)
  test('displays correct total orders count', ...)
  test('renders recent orders table', ...)
  test('renders chart component', ...)
})
```

Buat `src/app/admin/__tests__/layout.test.tsx`:
```tsx
describe('Admin Layout', () => {
  test('renders sidebar with all nav items', ...)
  test('renders admin name in header', ...)
  test('renders logout button', ...)
})
```

### Acceptance Criteria:
- [ ] Sidebar: dark, professional, responsive collapse
- [ ] Dashboard stat cards dengan gradient/shadow
- [ ] I3: Pendapatan hanya dari pesanan Selesai
- [ ] Chart statistik
- [ ] Pesanan terbaru table
- [ ] Desain BERBEDA dari storefront
- [ ] **Semua test PASS**
```

---

## Phase 16: Admin — CRUD Kategori

### PRD Rules: B1, B5

### Prompt:

```
Baca PRD.md Section 5.2, 12.2 (rules B1, B5).
Baca skill shadcn SKILL.md.

Install shadcn components: `npx shadcn@latest add dialog table`

1. **`src/app/api/admin/categories/route.ts`:**
   - GET: daftar kategori + count buku per kategori
   - POST: tambah kategori. Rule B5: nama unik (case-insensitive)

2. **`src/app/api/admin/categories/[id]/route.ts`:**
   - PUT: edit kategori. Rule B5: nama unik
   - DELETE: Rule B1: Tolak jika masih ada buku → 400 "Kategori masih memiliki {n} buku"

3. **`src/app/admin/categories/page.tsx`:**
   - Table: nama kategori, jumlah buku, aksi (edit, hapus)
   - Dialog untuk tambah & edit (reuse 1 dialog with mode: "create" | "edit")
   - Tombol hapus: Rule B1 → disabled + Tooltip "Pindahkan buku terlebih dahulu" jika count > 0
   - Jika bisa hapus → AlertDialog konfirmasi
   - Toast sukses/error
   - **Design:** Consistent with admin theme. Table well-spaced, action buttons clean.

### Testing:

Buat `src/app/api/admin/categories/__tests__/route.test.ts`:
```ts
describe('POST /api/admin/categories', () => {
  test('creates category', ...)
  test('B5: rejects duplicate name (case-insensitive)', ...)
  test('rejects empty name', ...)
})

describe('PUT /api/admin/categories/[id]', () => {
  test('updates category name', ...)
  test('B5: rejects duplicate name', ...)
})

describe('DELETE /api/admin/categories/[id]', () => {
  test('B1: rejects delete when category has books', ...)
  test('B1: error message includes book count', ...)
  test('deletes category when no books', ...)
})
```

### Acceptance Criteria:
- [ ] CRUD kategori berfungsi
- [ ] B5: Nama unik (case-insensitive)
- [ ] B1: Hapus diblokir jika ada buku + pesan jelas
- [ ] Dialog add/edit reusable
- [ ] **Semua test PASS**
```

---

## Phase 17: Admin — CRUD Buku (Pretty)

### PRD Rules: B2, B3, B4, B6, B7, H1, H2, H5, H6, H7

### UI Design Direction:
> Book form harus clean dengan image upload preview yang premium. Gambar preview rounded, shadow. Form fields well-organized dengan sections.

### Prompt:

```
Baca PRD.md Section 5.3, 12.2 (rules B2-B4, B6, B7), 12.10 (Upload rules H1, H2, H5, H6, H7).
Baca skill shadcn SKILL.md.
Baca skill frontend-design SKILL.md.

1. **`src/app/api/admin/books/route.ts`:**
   - GET: daftar buku + include kategori, pagination (rule I4), search
   - POST: tambah buku (FormData)
     - Validasi Zod: title, author, publisher, year (B7: valid, tidak future), price (B3: > 0), stock (B4: >= 0), category_id, description
     - Rule B6: Gambar wajib saat create
     - Rule H2: Compress gambar server-side juga (safety net)
     - Rule H5: Simpan ke `public/uploads/books/{uuid}.{ext}`
     - Rule H1: Validasi tipe file

2. **`src/app/api/admin/books/[id]/route.ts`:**
   - PUT: edit buku (FormData). Rule B6: gambar lama dipertahankan jika tidak diganti. Rule H6: hapus file lama jika diganti.
   - DELETE: Rule B2: Cek pesanan aktif (status bukan "Selesai"/"Dibatalkan"). Jika ada → tolak.

3. **`src/app/admin/books/page.tsx`:**
   - Table: thumbnail (rounded, small), judul, penulis, kategori, harga (formatRupiah), stok, aksi
   - Pagination + search bar
   - Dialog/Sheet untuk form tambah/edit:
     - **Image upload:** Drag zone + preview (rounded, shadow)
     - Fields organized: Section "Info Buku" (title, author, publisher, year), Section "Detail" (category select, price, stock), Section "Deskripsi" (textarea)
     - FieldGroup + Field pattern
   - Hapus: AlertDialog + rule B2 error handling
   - Toast sukses/error

### Testing:

Buat `src/app/api/admin/books/__tests__/route.test.ts`:
```ts
describe('POST /api/admin/books', () => {
  test('creates book with all fields', ...)
  test('B3: rejects price <= 0', ...)
  test('B4: rejects stock < 0', ...)
  test('B6: rejects create without image', ...)
  test('B7: rejects future year', ...)
  test('B7: rejects non-numeric year', ...)
  test('H1: rejects non-image file', ...)
  test('H5: saves with UUID filename', ...)
})

describe('PUT /api/admin/books/[id]', () => {
  test('updates book fields', ...)
  test('B6: keeps old image when no new image uploaded', ...)
  test('H6: deletes old image file when new image uploaded', ...)
})

describe('DELETE /api/admin/books/[id]', () => {
  test('B2: rejects delete when book has active orders', ...)
  test('B2: allows delete when all orders are Selesai/Dibatalkan', ...)
  test('deletes book successfully', ...)
})
```

### Acceptance Criteria:
- [ ] CRUD buku lengkap
- [ ] Upload: drag zone + preview (rounded, shadow)
- [ ] B3: harga > 0, B4: stok >= 0, B7: tahun valid
- [ ] B6: Gambar wajib create, opsional edit
- [ ] B2: Hapus diblokir jika pesanan aktif
- [ ] H5: UUID rename, H6: old file deleted
- [ ] Pagination + search (I4)
- [ ] **Semua test PASS**
```

---

## Phase 18: Admin — Daftar User

### PRD Rules: I2, I4

### Prompt:

```
Baca PRD.md Section 5.4, 12.11 (rule I2, I4).

1. **`src/app/api/admin/users/route.ts`** — GET:
   - List users (**exclude password field!** — security)
   - Search by nama/email
   - Pagination (rule I4)

2. **`src/app/admin/users/page.tsx`:**
   - Table: nama, email, telepon, alamat, tanggal registrasi, role (Badge variant)
   - Search + pagination
   - Rule I2: Jika fitur hapus ada, admin tidak bisa hapus dirinya sendiri
   - Read-only list (sesuai PRD — tidak ada CRUD user di admin)
   - **Design:** Consistent admin table style dengan Phase 16, 17

### Testing:

Buat `src/app/api/admin/users/__tests__/route.test.ts`:
```ts
describe('GET /api/admin/users', () => {
  test('returns users WITHOUT password field', ...)
  test('search by name works', ...)
  test('search by email works', ...)
  test('I4: pagination works', ...)
  test('returns role field for each user', ...)
})
```

### Acceptance Criteria:
- [ ] List user: tanpa password field
- [ ] Search + pagination (I4)
- [ ] Role Badge
- [ ] I2: Self-delete protection (jika applicable)
- [ ] **Semua test PASS**
```

---

## Phase 19: Admin — Kelola Pesanan (Pretty + Feature-Heavy)

### PRD Rules: F6, I1, I3, J2, dan SELURUH status transition 12.8

### UI Design Direction:
> Pesanan admin adalah FEATURE CENTER. Filter tabs styling, detail order clear, verifikasi transfer dengan image viewer, input resi prominent. Status update buttons hanya tampil untuk transisi yang valid.

### Prompt:

```
Baca PRD.md Section 5.5, 12.8 (Status Transition Rules LENGKAP), 12.9 (Stok Lifecycle), 12.11 (I1, I3), 12.12 (J2).
Baca skill shadcn SKILL.md.

1. **`src/app/api/admin/orders/route.ts`** — GET:
   - List semua pesanan + include user info
   - Filter by status (query param)
   - Pagination (I4)

2. **`src/app/api/admin/orders/[id]/status/route.ts`** — PUT:
   - Body: { status, resi? }
   - **Validasi transisi status KETAT** sesuai PRD 12.8 — gunakan VALID_TRANSITIONS dari types:
     - Menunggu Pembayaran → Dibatalkan
     - Menunggu Verifikasi → Menunggu Pengiriman (terima) ATAU Menunggu Pembayaran (tolak)
     - Menunggu Pengiriman → Dikirim (I1: resi wajib!) ATAU Dibatalkan
     - Dikirim → Selesai ATAU Dibatalkan
     - Selesai/Dibatalkan → **TOLAK** (status final, tidak bisa diubah)
   - **Transisi ke Dibatalkan** → kembalikan stok dalam transaction (J2):
     - Loop order_details, UPDATE books SET stock = stock + quantity
   - Tolak transisi invalid: return 400 "Transisi status tidak valid"

3. **`src/app/admin/orders/page.tsx`:**
   - **Filter tabs** (shadcn Tabs): Semua, Menunggu Pembayaran, Menunggu Verifikasi, ..., Selesai, Dibatalkan
   - Table: order_code, nama user, tanggal, metode bayar, status badge, total, aksi
   - Pagination
   - Klik row → detail (Sheet atau halaman)

4. **Detail pesanan admin** (Sheet atau `/admin/orders/[id]`):
   - Semua info pesanan + list item
   - **Bukti transfer:** Jika metode transfer + payment_proof ada:
     - Image viewer (klik untuk zoom → Dialog dengan gambar besar)
     - Tombol "Terima" (success) → status "Menunggu Pengiriman" (rule F6)
     - Tombol "Tolak" (destructive) → status "Menunggu Pembayaran" (rule F6)
   - **Input resi:** FieldGroup + Input + Button. Rule I1: wajib sebelum "Dikirim"
   - **Update status:** Buttons HANYA untuk transisi yang VALID dari status saat ini
     - Render berdasarkan VALID_TRANSITIONS[currentStatus]
     - Tombol "Batalkan" (destructive variant) hanya jika Dibatalkan in valid transitions

### Testing:

Buat `src/app/api/admin/orders/__tests__/status.test.ts`:
```ts
describe('PUT /api/admin/orders/[id]/status', () => {
  // STATUS TRANSITIONS
  test('Menunggu Pembayaran → Dibatalkan: allowed', ...)
  test('Menunggu Pembayaran → Menunggu Pengiriman: REJECTED', ...)
  test('Menunggu Verifikasi → Menunggu Pengiriman: allowed (terima)', ...)
  test('Menunggu Verifikasi → Menunggu Pembayaran: allowed (tolak)', ...)
  test('Menunggu Pengiriman → Dikirim: allowed with resi', ...)
  test('I1: Menunggu Pengiriman → Dikirim: REJECTED without resi', ...)
  test('Menunggu Pengiriman → Dibatalkan: allowed', ...)
  test('Dikirim → Selesai: allowed', ...)
  test('Dikirim → Dibatalkan: allowed', ...)
  test('Selesai → any: REJECTED (final status)', ...)
  test('Dibatalkan → any: REJECTED (final status)', ...)

  // STOCK RESTORATION
  test('J2: cancel restores stock for each item in transaction', ...)
  test('J2: stock restoration is atomic (all or nothing)', ...)

  // TRANSFER VERIFICATION
  test('F6: admin accepts → Menunggu Pengiriman', ...)
  test('F6: admin rejects → Menunggu Pembayaran', ...)
})
```

### Acceptance Criteria:
- [ ] Filter tabs by status
- [ ] Transisi status KETAT sesuai PRD 12.8
- [ ] Transisi illegal → ditolak (400)
- [ ] I1: Resi wajib sebelum "Dikirim"
- [ ] J2: Pembatalan → stok dikembalikan (transaction)
- [ ] F6: Verifikasi transfer terima/tolak
- [ ] Status final (Selesai/Dibatalkan) tidak bisa diubah
- [ ] Status buttons hanya tampil untuk transisi valid
- [ ] Bukti transfer: image viewer + zoom
- [ ] **Semua test PASS — 13+ test cases**
```

---

## Phase 20: Order Expiration (Cron)

### PRD Rules: F7, G6, J2

### Prompt:

```
Baca PRD.md Section 12.6 rule F7, 12.7 rule G6, 12.12 rule J2.

1. **`src/app/api/cron/expire-orders/route.ts`** — GET:
   - Header auth: `Authorization: Bearer {CRON_SECRET}` — tolak tanpa auth (401)
   - Cari orders: payment_method = "TRANSFER" AND status = "Menunggu Pembayaran" AND created_at < 24 jam lalu (rule F7)
   - Per order (dalam transaction, rule J2):
     - Update status → "Dibatalkan"
     - Kembalikan stok per item
   - Return { expired: count }
   - Rule G6: Midtrans expiry di-handle via webhook, BUKAN cron

2. **`vercel.json`:**
   ```json
   { "crons": [{ "path": "/api/cron/expire-orders", "schedule": "0 * * * *" }] }
   ```

### Testing:

Buat `src/app/api/cron/__tests__/expire-orders.test.ts`:
```ts
describe('GET /api/cron/expire-orders', () => {
  test('returns 401 without CRON_SECRET', ...)
  test('returns 401 with wrong CRON_SECRET', ...)
  test('F7: expires transfer orders older than 24h', ...)
  test('F7: does NOT expire transfer orders newer than 24h', ...)
  test('does NOT expire COD or MIDTRANS orders', ...)
  test('does NOT expire orders already in other status', ...)
  test('J2: restores stock for each expired order item', ...)
  test('J2: stock restoration in transaction', ...)
  test('returns count of expired orders', ...)
})
```

### Acceptance Criteria:
- [ ] F7: Transfer > 24 jam → dibatalkan + stok kembali
- [ ] G6: Midtrans NOT touched by cron
- [ ] J2: Stok dikembalikan dalam transaction
- [ ] Endpoint terproteksi (CRON_SECRET)
- [ ] Cron config valid
- [ ] **Semua test PASS**
```

---

## Phase 21: Polish — Loading, Error, Empty States (Pretty)

### PRD Rules: - (UX polish, no new business logic)

### UI Design Direction:
> Loading states harus smooth, bukan flickering. Error pages harus helpful. Empty states harus encouraging, bukan depressing. 404 page bisa jadi kreatif (ilustrasi buku hilang).

### Prompt:

```
Baca skill shadcn SKILL.md — gunakan Skeleton, Alert, Spinner components.
Baca skill frontend-design SKILL.md — setiap state (loading, error, empty) harus punya desain yang dipikirkan.

1. **Loading states — SEMUA halaman:**
   - `loading.tsx` files per route group, menggunakan Skeleton layout yang mirror content
   - Button loading: Spinner + disabled + text berubah (misal "Simpan..." bukan "Simpan")
   - Form submission: full-form overlay atau button spinner

2. **Error handling:**
   - `error.tsx` files per route group — styled error boundary
   - `src/app/not-found.tsx` — **Custom 404 page:**
     - Ilustrasi kreatif (buku hilang, rak kosong)
     - "Halaman tidak ditemukan" + "Kembali ke Beranda" button
     - Sesuai overall theme
   - Toast (sonner) untuk semua operasi gagal — error message clear

3. **Empty states** menggunakan shadcn Empty:
   - Cart kosong: ilustrasi + "Keranjang masih kosong" + CTA
   - Belum ada pesanan: ilustrasi + "Mulai belanja"
   - Pencarian tidak ada hasil: ilustrasi + "Coba kata kunci lain"
   - Admin belum ada buku/kategori/pesanan: ilustrasi + CTA tambah

4. **SEO:**
   - Metadata (title, description) di setiap halaman
   - `generateMetadata` untuk halaman dinamis (detail buku): title = "Judul Buku — USK BookStore"
   - Open Graph metadata

### Testing:

Buat `src/app/__tests__/not-found.test.tsx`:
```tsx
describe('404 Page', () => {
  test('renders custom 404 illustration', ...)
  test('has link back to home', ...)
})
```

Buat `src/app/__tests__/metadata.test.ts`:
```ts
describe('Metadata', () => {
  test('home page has correct title', ...)
  test('book detail generates dynamic metadata', ...)
})
```

### Acceptance Criteria:
- [ ] Skeleton loading states mirror content layout
- [ ] 404 page: ilustrasi kreatif, link home
- [ ] Error boundary: styled, helpful
- [ ] Empty states: ilustrasi + CTA (BUKAN boring text)
- [ ] Toast errors: clear messages
- [ ] SEO metadata di setiap halaman
- [ ] **Semua test PASS**
```

---

## Phase 22: Responsive, Animations & Final Testing

### PRD Rules: SEMUA (full regression)

### UI Design Direction:
> Final polish — micro-interactions, hover effects konsisten, transitions smooth, responsive perfect. Ini yang membuat app terasa "finished" bukan "demo".

### Prompt:

```
Baca skill frontend-design SKILL.md — final polish pass.

1. **Responsive check SEMUA halaman:**
   - Mobile (375px), Tablet (768px), Desktop (1280px)
   - Fix layout yang broken
   - Navbar mobile (Sheet menu) smooth
   - Admin sidebar collapse smooth
   - Form layouts reflow correctly di mobile
   - Cards grid responsive (1/2/3/4 columns)
   - Images scale properly

2. **Animasi & Polish:**
   - Page transitions: subtle fade-in
   - Button hover: consistent across all buttons
   - Card hover: lift effect (translateY + shadow)
   - Link underline: animated
   - Toast: slide-in smooth
   - Dialog: scale animation
   - Scroll-to-top button (jika page panjang)
   - Focus states visible (accessibility)

3. **Accessibility check:**
   - Semua form inputs punya label (FieldGroup + FieldLabel)
   - Alt text pada gambar
   - Keyboard navigation berfungsi
   - Color contrast sufficient

4. **Final Regression Testing Checklist — HARUS SEMUA PASS:**

   **User Flows:**
   - [ ] Register → Login → Browse buku → Add to Cart → Checkout COD → Admin update status sampai Selesai
   - [ ] Register → Login → Add to Cart → Checkout Transfer → Upload bukti → Admin verifikasi → Admin input resi → Dikirim → Selesai
   - [ ] Register → Login → Add to Cart → Checkout Midtrans → Snap payment → Webhook → Auto status update

   **Business Logic:**
   - [ ] C1: Cart quantity max = stok
   - [ ] C3: Add same book → increment (bukan duplikat)
   - [ ] C4: Stok habis → button disabled
   - [ ] C5: Stok berkurang → warning + auto-adjust
   - [ ] C6: Buku dihapus → auto-remove dari cart
   - [ ] D1: Checkout re-validates stock
   - [ ] D3: 2 user checkout buku terakhir (stok 1) → hanya 1 berhasil
   - [ ] D5: Harga snapshot di order_details
   - [ ] D10: User A tidak bisa akses order User B

   **Admin:**
   - [ ] B1: Kategori tidak bisa dihapus jika ada buku
   - [ ] B2: Buku tidak bisa dihapus jika ada pesanan aktif
   - [ ] I1: Resi wajib sebelum "Dikirim"
   - [ ] I3: Pendapatan hanya dari pesanan Selesai
   - [ ] F6: Verifikasi transfer terima/tolak
   - [ ] Status transition illegal → ditolak

   **Payment:**
   - [ ] F7: Transfer 24 jam timeout → auto-cancel + stok kembali
   - [ ] G3: Webhook signature verification
   - [ ] G4: Webhook idempotent
   - [ ] G5: Payment cancel/expire → stok kembali

   **UI:**
   - [ ] Mobile responsive SEMUA halaman
   - [ ] Loading states ada di semua halaman
   - [ ] Empty states ada di semua list
   - [ ] 404 page custom
   - [ ] Error boundary menangkap crash

5. **Seed data final:**
   - Update seed: buku dengan cover dari picsum.photos (bebas hak cipta)
   - Beberapa pesanan sample berbagai status
   - Siap demo

6. **Run full test suite:**
   ```
   npm run test:coverage
   ```
   Target: **80%+ code coverage**

### Testing:

Buat `src/tests/integration/full-flow.test.ts`:
```ts
describe('Integration: Full Purchase Flow', () => {
  test('COD flow: register → login → add to cart → checkout → admin process', ...)
  test('Transfer flow: register → login → add to cart → checkout → upload proof → admin verify', ...)
  test('Race condition: concurrent checkout for last stock item', ...)
})
```

Buat `src/tests/integration/admin-flow.test.ts`:
```ts
describe('Integration: Admin Operations', () => {
  test('CRUD category with business rules (B1, B5)', ...)
  test('CRUD book with business rules (B2-B7)', ...)
  test('Order status management with all transitions', ...)
})
```

### Acceptance Criteria:
- [ ] Seluruh regression testing checklist PASSED
- [ ] Responsive di semua viewport (375, 768, 1280)
- [ ] Hover/focus animations consistent
- [ ] Accessibility: labels, alt texts, keyboard nav
- [ ] `npm run test:coverage` → **80%+ coverage**
- [ ] Siap demo untuk USK
```

---

## Ringkasan Phase

| # | Phase | Fokus | PRD Rules | Tests |
|---|---|---|---|---|
| 0 | Init Project & Prisma | Setup + testing infra | - | Schema test |
| 1 | Seed & Utilities | Seed DB + helpers | D9 | Utils, transitions |
| 2 | Auth — Config | NextAuth + middleware | A1-A7 | Register API, validation |
| 3 | Auth — UI ✨ | Login/Register (split-screen) | A1,A3,A4 | Form renders, validation |
| 4 | Layout ✨ | Navbar & Footer (premium) | A5,A6,A7,C9 | Navbar states, footer |
| 5 | Home ✨ | Hero + sections (showpiece) | - | BookCard, home render |
| 6 | Katalog ✨ | Search, filter, detail | C1,C4 | API books, detail page |
| 7 | About & Contact ✨ | Static + WA redirect | - | Contact form, WA URL |
| 8 | Cart — API | All cart logic | C1-C9 | 18+ API tests |
| 9 | Cart — UI ✨ | Cart page + badge | C1,C2,C5,C6,C9 | Cart page, hook |
| 10 | Checkout — API 🔴 | Transaction (KRITIS) | C9,D1-D10,E1,F1,G1,J1,J4 | 17+ API tests |
| 11 | Checkout — UI ✨ | Invoice-style + methods | D4,E1,F1,G1 | Checkout page, badge |
| 12 | Orders — UI ✨ | Timeline stepper | D10 | Orders list, detail |
| 13 | Upload Transfer ✨ | Compress + upload | F1-F7,H1-H7 | Compress, upload API |
| 14 | Midtrans | Snap + webhook | G1-G6,J2 | Webhook, signature |
| 15 | Admin Layout ✨ | Dashboard (dark sidebar) | I3,I4 | Dashboard data |
| 16 | Admin Kategori | CRUD kategori | B1,B5 | CRUD API tests |
| 17 | Admin Buku ✨ | CRUD buku + upload | B2-B7,H1-H7 | CRUD API tests |
| 18 | Admin User | List user | I2,I4 | API tests |
| 19 | Admin Pesanan ✨ | Status management | F6,I1,J2,12.8 | 13+ transition tests |
| 20 | Cron Expire | Auto-cancel 24h | F7,G6,J2 | 9 cron tests |
| 21 | Polish ✨ | Loading/error/empty | - | 404, metadata |
| 22 | Final ✨ | Responsive + regression | ALL | Integration, coverage |

**Legenda:**
- ✨ = Phase dengan fokus UI/design (baca frontend-design skill)
- 🔴 = Phase kritis (business logic paling kompleks)

---

## Skills per Phase

| Skill | Phase |
|---|---|
| `shadcn` | 0, 3, 4, 5, 6, 9, 11, 12, 15, 16, 17, 19, 21 |
| `frontend-design` | 3, 4, 5, 6, 7, 9, 11, 12, 15, 17, 19, 21, 22 |
| `vercel-react-best-practices` | 2, 5, 6, 10, 21 |
| `algorithmic-art` *(inspirasi)* | 5 (hero decorative elements) |

## Context7 — Library Docs per Phase

| Phase | Library | Topic |
|---|---|---|
| 0 | next.js | app router, project setup |
| 0 | prisma | schema, mysql |
| 0 | vitest | config, setup |
| 2 | next-auth | v5, credentials, middleware |
| 2 | zod | schema validation |
| 6 | next.js | searchParams, pagination |
| 8 | prisma | transactions, relations |
| 10 | prisma | interactive transactions, isolation |
| 13 | browser-image-compression | compress options |
| 14 | midtrans-client | snap, webhook, signature |

## Testing Summary

| Phase | Test Files | Approx. Test Cases |
|---|---|---|
| 0 | 1 (schema) | 5 |
| 1 | 2 (utils, transitions) | 12 |
| 2 | 2 (register API, validation) | 15 |
| 3 | 2 (register page, login page) | 12 |
| 4 | 2 (navbar, footer) | 9 |
| 5 | 2 (book card, home page) | 10 |
| 6 | 2 (books API, detail page) | 14 |
| 7 | 2 (contact, about) | 9 |
| 8 | 1 (cart API — GET/POST/PUT/DELETE) | 18 |
| 9 | 2 (cart page, useCart hook) | 10 |
| 10 | 3 (checkout, orders GET, orders [id]) | 17 |
| 11 | 2 (checkout page, status badge) | 11 |
| 12 | 2 (orders list, detail) | 10 |
| 13 | 2 (compression, upload API) | 12 |
| 14 | 2 (midtrans lib, webhook API) | 10 |
| 15 | 2 (dashboard, layout) | 8 |
| 16 | 1 (categories API) | 7 |
| 17 | 1 (books admin API) | 10 |
| 18 | 1 (users API) | 5 |
| 19 | 1 (order status API) | 13 |
| 20 | 1 (cron expire) | 9 |
| 21 | 2 (404, metadata) | 5 |
| 22 | 2 (integration flows) | 6 |
| **Total** | **~40 test files** | **~237 test cases** |

### Target Coverage: **80%+** pada `npm run test:coverage`
