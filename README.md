# BukuCerdas - Toko Buku Online

Aplikasi fullstack toko buku online berbasis **Next.js 15** dengan **TypeScript**, **Tailwind CSS**, dan **framer-motion**.

## 🚀 Tech Stack

### Frontend
- **Next.js 15.5** (App Router)
- **React 19** 
- **TypeScript 5.8**
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **framer-motion 12.23** - Animasi UI & 3D book showcase
- **lucide-react 0.554** - Icon library

### Backend (Phase Berikutnya)
- **API Routes** (Next.js)
- **Prisma** - ORM untuk MySQL
- **MySQL** (via Laragon)
- **JWT** - Autentikasi & authorization

## 📁 Struktur Project

```
BukuCerdas/
├── app/
│   ├── (marketing)/
│   │   └── _components/
│   │       ├── Navbar.tsx          # Navigasi dengan Link Next.js
│   │       ├── Hero.tsx            # Hero section dengan animasi
│   │       ├── Features.tsx        # 4 fitur utama
│   │       ├── BookShowcase.tsx    # 3D book showcase (kompleks!)
│   │       ├── Categories.tsx      # 6 kategori buku
│   │       ├── BestSellers.tsx     # Buku terlaris
│   │       ├── Testimonials.tsx    # Testimoni pelanggan
│   │       └── Footer.tsx          # Footer dengan kontak
│   ├── tentang-kami/
│   │   └── page.tsx                # Halaman About Us
│   ├── login/
│   │   └── page.tsx                # Placeholder login
│   ├── register/
│   │   └── page.tsx                # Placeholder register
│   ├── layout.tsx                  # Root layout dengan fonts
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Tailwind + custom 3D CSS
├── public/                          # Assets statis (future)
├── landingpage/                     # Folder lama Vite (referensi)
├── .env.example                     # Template environment variables
├── .gitignore
├── next.config.mjs                  # Config Next.js + remote images
├── tailwind.config.ts               # Config Tailwind
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## 🎯 Fitur yang Sudah Diimplementasikan

### ✅ Phase 1: Bootstrap & UI Migration (Current)
1. **Next.js App Router Setup**
   - Next.js 15 dengan React 19
   - TypeScript configuration
   - Tailwind CSS + PostCSS
   - Font optimization (Inter & Libre Baskerville)

2. **Landing Page (`/`)**
   - Navbar dengan navigasi responsif
   - Hero section dengan grid gambar buku
   - Features section (4 kartu keunggulan)
   - **BookShowcase 3D** - Buku 3D interaktif dengan scroll-based animation
   - Categories (6 kategori populer)
   - Best Sellers (4 buku terlaris)
   - Testimonials (2 ulasan pelanggan)
   - CTA section dengan pattern background
   - Footer lengkap

3. **Halaman Tentang Kami (`/tentang-kami`)**
   - Header dengan breadcrumb
   - Story section dengan gambar & konten
   - Values section (3 nilai utama)
   - Process section (4 step workflow)
   - Team section (3 anggota tim)
   - WhatsApp CTA button
   - Animasi framer-motion di semua section

4. **Placeholder Pages**
   - `/login` - Halaman login (untuk phase berikutnya)
   - `/register` - Halaman register (untuk phase berikutnya)

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 18+ 
- **npm** atau **pnpm** atau **yarn**
- **Git**

### Step 1: Clone & Install Dependencies

```bash
# Clone repository (jika dari Git)
git clone <repository-url>
cd BukuCerdas

# Install dependencies
npm install
```

### Step 2: Environment Variables

Buat file `.env.local` berdasarkan `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Database (untuk phase berikutnya)
DATABASE_URL="mysql://root:@localhost:3306/bukucerdas"

# JWT Secret (untuk autentikasi phase berikutnya)
JWT_SECRET="your-secret-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Run Development Server

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

### Step 4: Build untuk Production

```bash
npm run build
npm run start
```

## 🎨 Styling & Design System

### Colors
- **Background**: `#FDFBF7` (Warm cream)
- **Primary Text**: Slate 900
- **Accent**: Amber 700
- **Secondary**: Slate 600

### Typography
- **Sans-serif**: Inter (body text, UI)
- **Serif**: Libre Baskerville (headings, quotes)

### Key Tailwind Utilities
```css
/* Custom 3D CSS for BookShowcase */
.preserve-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.perspective-1000 { perspective: 1000px; }
```

## 📦 Dependencies

### Production
- `next` 15.5
- `react` 19.0
- `react-dom` 19.0
- `framer-motion` 12.23
- `lucide-react` 0.554

### Development
- `typescript` 5.8
- `tailwindcss` 3.4
- `postcss` 8.4
- `autoprefixer` 10.4
- `eslint` 8.57
- `eslint-config-next` 15.1

## 🔍 Komponen Penting

### 1. BookShowcase.tsx (Komponen Kompleks)
Komponen ini adalah highlight utama landing page:
- **3D hardcover book** dengan cover, spine, dan page block
- **Scroll-based animation** menggunakan `useScroll` & `useTransform` framer-motion
- Cover buku membuka hingga -160° saat scroll
- **Feature cards** yang fade in/out di berbagai phase
- **SVG annotation lines** yang animated
- Custom 3D CSS: `preserve-3d`, `perspective-1000`, `backface-hidden`

**Tips Modifikasi:**
- Edit gambar cover: ganti URL di `<img src="...">`
- Ubah dimensi buku: ubah `width`, `height`, `depth` di component
- Sesuaikan scroll speed: ubah array values di `useTransform`

### 2. Navbar.tsx
- Fixed navbar dengan glassmorphism effect saat scroll
- Mobile menu responsif
- Next.js `<Link>` untuk client-side navigation
- Active state styling

### 3. Layout.tsx
- Next.js font optimization dengan `next/font/google`
- Global metadata (SEO-ready)
- Root HTML structure

## 🚧 Next Steps (Phase 2+)

### Backend & Database
- [ ] Setup Prisma dengan MySQL (Laragon)
- [ ] Buat schema database (User, Buku, Kategori, Pesanan, dll)
- [ ] API Routes untuk CRUD operations
- [ ] Autentikasi JWT (login/register)
- [ ] Role-based access (admin vs user)

### User Features
- [ ] Katalog buku dengan filter & search
- [ ] Detail buku dengan ulasan
- [ ] Keranjang belanja
- [ ] Checkout & pembayaran (COD + upload bukti)
- [ ] Profil user & alamat pengiriman
- [ ] Riwayat pesanan & tracking

### Admin Features
- [ ] Dashboard admin dengan grafik
- [ ] CRUD Kategori & Buku
- [ ] Manajemen User
- [ ] Konfirmasi pembayaran & pesanan
- [ ] Laporan pemasukan
- [ ] Pengaturan toko (pajak, ongkir)

## 📝 Konvensi Kode

### Penamaan
- **Components**: PascalCase (`Navbar.tsx`, `BookShowcase.tsx`)
- **Functions**: camelCase (`handleClick`, `fetchData`)
- **Database fields**: camelCase Indonesia (`namaLengkap`, `tanggalDaftar`)

### File Organization
- Client components: `'use client'` directive di top file
- Server components: default (no directive needed)
- Group routes dengan `(folderName)` untuk routing bersama

### Styling
- Prioritas: Tailwind utility classes
- Hindari inline styles kecuali untuk dynamic values
- Custom CSS: gunakan `globals.css` atau CSS modules

## 🐛 Troubleshooting

### Error: Module not found 'react'
```bash
npm install --force
# atau
rm -rf node_modules package-lock.json
npm install
```

### Error: Tailwind directives tidak dikenali
- Ini hanya warning VS Code, bukan error runtime
- Aplikasi tetap berjalan normal
- Install Tailwind CSS IntelliSense extension untuk menghilangkan warning

### Port 3000 sudah digunakan
```bash
# Ubah port di package.json
"dev": "next dev -p 3001"
```

### Image loading lambat dari Unsplash/Supabase
- Download gambar dan simpan di `public/images/`
- Update path: `src="/images/book.jpg"`
- Next.js akan otomatis optimize

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Prisma Docs](https://www.prisma.io/docs)

## 👥 Contributors

- **Andi Pratama** - Founder & Kurator
- **Siti Rahma** - Operasional
- **Budi Santoso** - Customer Happiness

## 📄 License

© 2023 BukuCerdas. Hak Cipta Dilindungi.

---

**Status Project**: ✅ Phase 1 Complete - UI & Bootstrap selesai  
**Next Milestone**: Phase 2 - Database & Backend API
