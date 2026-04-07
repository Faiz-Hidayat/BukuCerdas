import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: tanggal N hari yang lalu
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 0, 0, 0);
  return d;
};

async function main() {
  console.log('🌱 Memulai seeding database BukuCerdas...');

  // 0. Bersihkan semua data transaksional
  console.log('🧹 Membersihkan data lama...');
  await prisma.detailPesanan.deleteMany();
  await prisma.notifikasiAdmin.deleteMany();
  await prisma.pesanan.deleteMany();
  await prisma.itemKeranjang.deleteMany();
  await prisma.keranjang.deleteMany();
  await prisma.ulasanBuku.deleteMany();
  await prisma.alamatUser.deleteMany();
  await prisma.pesanKontak.deleteMany();
  await prisma.tarifOngkir.deleteMany();
  await prisma.pengeluaran.deleteMany();
  await prisma.buku.deleteMany();
  await prisma.kategoriBuku.deleteMany();
  await prisma.pengaturanToko.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Data lama berhasil dibersihkan');

  // ============================================================
  // 1. USERS
  // ============================================================
  console.log('👤 Membuat users...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      namaLengkap: 'Administrator BukuCerdas',
      username: 'admin',
      email: 'admin@bukucerdas.com',
      kataSandiHash: adminHash,
      role: 'admin',
      nomorTelepon: '081234567890',
      statusAkun: 'aktif',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      namaLengkap: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      kataSandiHash: userHash,
      role: 'user',
      nomorTelepon: '081298765432',
      statusAkun: 'aktif',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      namaLengkap: 'Siti Rahma',
      username: 'sitirahma',
      email: 'siti@example.com',
      kataSandiHash: userHash,
      role: 'user',
      nomorTelepon: '081377889900',
      statusAkun: 'aktif',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      namaLengkap: 'Budi Santoso',
      username: 'budisantoso',
      email: 'budi@example.com',
      kataSandiHash: userHash,
      role: 'user',
      nomorTelepon: '081455667788',
      statusAkun: 'aktif',
    },
  });
  console.log('✅ 4 users berhasil dibuat');

  // ============================================================
  // 2. KATEGORI BUKU
  // ============================================================
  console.log('📚 Membuat kategori buku...');
  const [katFiksi, katNonFiksi, katPendidikan, katReligius, katAnak, katTeknologi] = await Promise.all([
    prisma.kategoriBuku.create({ data: { namaKategori: 'Fiksi', deskripsi: 'Novel, cerita pendek, dan karya fiksi lainnya' } }),
    prisma.kategoriBuku.create({ data: { namaKategori: 'Non-Fiksi', deskripsi: 'Buku pengetahuan, biografi, dan referensi' } }),
    prisma.kategoriBuku.create({ data: { namaKategori: 'Pendidikan', deskripsi: 'Buku pelajaran, panduan belajar, dan materi akademik' } }),
    prisma.kategoriBuku.create({ data: { namaKategori: 'Religius', deskripsi: 'Buku agama, spiritual, dan keagamaan' } }),
    prisma.kategoriBuku.create({ data: { namaKategori: 'Anak-Anak', deskripsi: 'Buku cerita dan pembelajaran untuk anak' } }),
    prisma.kategoriBuku.create({ data: { namaKategori: 'Teknologi', deskripsi: 'Buku pemrograman, IT, dan teknologi' } }),
  ]);
  console.log('✅ 6 kategori berhasil dibuat');

  // ============================================================
  // 3. BUKU (12 buku)
  // ============================================================
  console.log('📖 Membuat buku...');
  const bukuData = [
    { idKategori: katFiksi.idKategori, judul: 'Laskar Pelangi', pengarang: 'Andrea Hirata', penerbit: 'Bentang Pustaka', tahunTerbit: 2005, isbn: '9789793062792', stok: 25, harga: 89000, sinopsis: 'Novel tentang kehidupan anak-anak di Belitung yang berjuang untuk mendapatkan pendidikan layak.', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', statusAktif: true },
    { idKategori: katFiksi.idKategori, judul: 'Bumi Manusia', pengarang: 'Pramoedya Ananta Toer', penerbit: 'Hasta Mitra', tahunTerbit: 1980, isbn: '9789799101129', stok: 15, harga: 95000, sinopsis: 'Novel pertama dari Tetralogi Buru.', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', statusAktif: true },
    { idKategori: katNonFiksi.idKategori, judul: 'Sapiens: Riwayat Singkat Umat Manusia', pengarang: 'Yuval Noah Harari', penerbit: 'KPG', tahunTerbit: 2017, isbn: '9786024246945', stok: 30, harga: 125000, sinopsis: 'Sejarah manusia dari zaman batu hingga era modern.', coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', statusAktif: true },
    { idKategori: katNonFiksi.idKategori, judul: 'Filosofi Teras', pengarang: 'Henry Manampiring', penerbit: 'Penerbit Buku Kompas', tahunTerbit: 2019, isbn: '9786024812058', stok: 40, harga: 98000, sinopsis: 'Pengantar filsafat Stoic.', coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', statusAktif: true },
    { idKategori: katPendidikan.idKategori, judul: 'Atomic Habits', pengarang: 'James Clear', penerbit: 'Gramedia', tahunTerbit: 2019, isbn: '9786020633176', stok: 50, harga: 109000, sinopsis: 'Panduan praktis membangun kebiasaan baik.', coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', statusAktif: true },
    { idKategori: katPendidikan.idKategori, judul: 'Deep Work', pengarang: 'Cal Newport', penerbit: 'Bentang Pustaka', tahunTerbit: 2018, isbn: '9786022914433', stok: 20, harga: 95000, sinopsis: 'Strategi untuk fokus tanpa gangguan.', coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400', statusAktif: true },
    { idKategori: katReligius.idKategori, judul: 'Tafsir Al-Misbah', pengarang: 'M. Quraish Shihab', penerbit: 'Lentera Hati', tahunTerbit: 2002, isbn: '9789799923196', stok: 12, harga: 850000, sinopsis: 'Tafsir Al-Quran lengkap.', coverUrl: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=400', statusAktif: true },
    { idKategori: katReligius.idKategori, judul: 'Jangan Bersedih', pengarang: 'Aidh al-Qarni', penerbit: 'Qisthi Press', tahunTerbit: 2004, isbn: '9789797567064', stok: 35, harga: 75000, sinopsis: 'Motivasi islami.', coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', statusAktif: true },
    { idKategori: katAnak.idKategori, judul: 'Si Kancil dan Buaya', pengarang: 'Cerita Rakyat Nusantara', penerbit: 'Erlangga for Kids', tahunTerbit: 2015, isbn: '9786024340377', stok: 45, harga: 35000, sinopsis: 'Cerita rakyat klasik.', coverUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400', statusAktif: true },
    { idKategori: katAnak.idKategori, judul: 'Ensiklopedia Dinosaurus untuk Anak', pengarang: 'Tim Penulis BIP', penerbit: 'BIP', tahunTerbit: 2020, isbn: '9786024834524', stok: 28, harga: 125000, sinopsis: 'Ensiklopedia dinosaurus.', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', statusAktif: true },
    { idKategori: katFiksi.idKategori, judul: 'Perahu Kertas', pengarang: 'Dee Lestari', penerbit: 'Bentang Pustaka', tahunTerbit: 2009, isbn: '9789793062853', stok: 22, harga: 88000, sinopsis: 'Novel romantis.', coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400', statusAktif: true },
    { idKategori: katTeknologi.idKategori, judul: 'Clean Code', pengarang: 'Robert C. Martin', penerbit: 'Prentice Hall', tahunTerbit: 2008, isbn: '9780132350884', stok: 18, harga: 185000, sinopsis: 'Panduan menulis kode yang bersih.', coverUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910auj4?w=400', statusAktif: true },
  ];

  const bukuList: any[] = [];
  for (const b of bukuData) {
    const buku = await prisma.buku.create({ data: b });
    bukuList.push(buku);
  }
  console.log(`✅ ${bukuList.length} buku berhasil dibuat`);

  // ============================================================
  // 4. PENGATURAN TOKO
  // ============================================================
  console.log('⚙️ Membuat pengaturan toko...');
  await prisma.pengaturanToko.create({
    data: {
      pajakPersen: 11.0,
      nomorRekening: '1234567890 (Bank BCA)',
      nomorEwallet: '081234567890 (OVO/GoPay)',
      qrisUrl: 'https://example.com/qris.png',
    },
  });

  // ============================================================
  // 5. TARIF ONGKIR
  // ============================================================
  console.log('🚚 Membuat tarif ongkir...');
  await prisma.tarifOngkir.createMany({
    data: [
      { kotaTujuan: 'Jakarta', zona: 'A', biayaOngkir: 15000 },
      { kotaTujuan: 'Bandung', zona: 'A', biayaOngkir: 20000 },
      { kotaTujuan: 'Surabaya', zona: 'B', biayaOngkir: 25000 },
      { kotaTujuan: 'Medan', zona: 'C', biayaOngkir: 35000 },
      { kotaTujuan: 'Makassar', zona: 'C', biayaOngkir: 40000 },
    ],
  });

  // ============================================================
  // 6. ALAMAT USERS
  // ============================================================
  console.log('🏠 Membuat alamat user...');
  const alamat1 = await prisma.alamatUser.create({
    data: { idUser: user1.idUser, namaPenerima: 'John Doe', nomorTelepon: '081298765432', kota: 'Jakarta', provinsi: 'DKI Jakarta', alamatLengkap: 'Jl. Sudirman No. 123, Jakarta Pusat', kodePos: '10220', isDefault: true },
  });
  const alamat2 = await prisma.alamatUser.create({
    data: { idUser: user2.idUser, namaPenerima: 'Siti Rahma', nomorTelepon: '081377889900', kota: 'Bandung', provinsi: 'Jawa Barat', alamatLengkap: 'Jl. Braga No. 45, Bandung', kodePos: '40111', isDefault: true },
  });
  const alamat3 = await prisma.alamatUser.create({
    data: { idUser: user3.idUser, namaPenerima: 'Budi Santoso', nomorTelepon: '081455667788', kota: 'Surabaya', provinsi: 'Jawa Timur', alamatLengkap: 'Jl. Tunjungan No. 78, Surabaya', kodePos: '60271', isDefault: true },
  });

  // ============================================================
  // 7. PESANAN — banyak dan tersebar untuk visualisasi chart
  // ============================================================
  console.log('🛍️ Membuat pesanan (30+ pesanan untuk visualisasi)...');

  // Kode pesanan unik
  const kode = (idx: number) => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `ORD-${y}${m}-${String(idx).padStart(4, '0')}`;
  };

  const alamatSnap = (a: { namaPenerima: string; nomorTelepon: string; alamatLengkap: string; kota: string; provinsi: string; kodePos: string }) =>
    JSON.stringify({ namaPenerima: a.namaPenerima, nomorTelepon: a.nomorTelepon, alamatLengkap: a.alamatLengkap, kota: a.kota, provinsi: a.provinsi, kodePos: a.kodePos });

  type PesananSeed = {
    kodePesanan: string;
    idUser: number;
    idAlamat: number;
    tanggalPesan: Date;
    metodePembayaran: 'cod' | 'transfer_bank' | 'ewallet' | 'qris';
    statusPembayaran: 'terkonfirmasi' | 'belum_dibayar' | 'menunggu_konfirmasi' | 'dibatalkan';
    statusPesanan: 'selesai' | 'diproses' | 'dikirim' | 'dibatalkan' | 'menunggu_pembayaran' | 'menunggu_verifikasi';
    subtotal: number;
    ongkir: number;
    pajakPersen: number;
    pajakNominal: number;
    totalBayar: number;
    alamatSnapshot: string;
    resi?: string;
    buktiPembayaranUrl?: string;
    items: { idBuku: number; jumlah: number; hargaSatuan: number; subtotal: number }[];
  };

  const pesananList: PesananSeed[] = [
    // === SELESAI (20 pesanan tersebar 60 hari untuk chart dashboard & laporan) ===
    { kodePesanan: kode(1), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(1), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 184000, ongkir: 15000, pajakPersen: 11, pajakNominal: 20240, totalBayar: 219240, alamatSnapshot: alamatSnap(alamat1), resi: 'JNE001', buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti1.jpg', items: [{ idBuku: bukuList[0].idBuku, jumlah: 1, hargaSatuan: 89000, subtotal: 89000 }, { idBuku: bukuList[1].idBuku, jumlah: 1, hargaSatuan: 95000, subtotal: 95000 }] },
    { kodePesanan: kode(2), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(2), metodePembayaran: 'ewallet', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 125000, ongkir: 20000, pajakPersen: 11, pajakNominal: 13750, totalBayar: 158750, alamatSnapshot: alamatSnap(alamat2), resi: 'JNT002', items: [{ idBuku: bukuList[2].idBuku, jumlah: 1, hargaSatuan: 125000, subtotal: 125000 }] },
    { kodePesanan: kode(3), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(3), metodePembayaran: 'cod', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 198000, ongkir: 25000, pajakPersen: 11, pajakNominal: 21780, totalBayar: 244780, alamatSnapshot: alamatSnap(alamat3), resi: 'SICEPAT003', items: [{ idBuku: bukuList[3].idBuku, jumlah: 2, hargaSatuan: 98000, subtotal: 196000 }] },
    { kodePesanan: kode(4), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(5), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 109000, ongkir: 15000, pajakPersen: 11, pajakNominal: 11990, totalBayar: 135990, alamatSnapshot: alamatSnap(alamat1), resi: 'JNE004', buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti4.jpg', items: [{ idBuku: bukuList[4].idBuku, jumlah: 1, hargaSatuan: 109000, subtotal: 109000 }] },
    { kodePesanan: kode(5), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(7), metodePembayaran: 'qris', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 95000, ongkir: 20000, pajakPersen: 11, pajakNominal: 10450, totalBayar: 125450, alamatSnapshot: alamatSnap(alamat2), resi: 'JNE005', items: [{ idBuku: bukuList[5].idBuku, jumlah: 1, hargaSatuan: 95000, subtotal: 95000 }] },
    { kodePesanan: kode(6), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(8), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 75000, ongkir: 25000, pajakPersen: 11, pajakNominal: 8250, totalBayar: 108250, alamatSnapshot: alamatSnap(alamat3), resi: 'JNT006', buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti6.jpg', items: [{ idBuku: bukuList[7].idBuku, jumlah: 1, hargaSatuan: 75000, subtotal: 75000 }] },
    { kodePesanan: kode(7), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(10), metodePembayaran: 'cod', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 213000, ongkir: 15000, pajakPersen: 11, pajakNominal: 23430, totalBayar: 251430, alamatSnapshot: alamatSnap(alamat1), resi: 'JNE007', items: [{ idBuku: bukuList[10].idBuku, jumlah: 1, hargaSatuan: 88000, subtotal: 88000 }, { idBuku: bukuList[2].idBuku, jumlah: 1, hargaSatuan: 125000, subtotal: 125000 }] },
    { kodePesanan: kode(8), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(12), metodePembayaran: 'ewallet', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 185000, ongkir: 20000, pajakPersen: 11, pajakNominal: 20350, totalBayar: 225350, alamatSnapshot: alamatSnap(alamat2), resi: 'SICEPAT008', items: [{ idBuku: bukuList[11].idBuku, jumlah: 1, hargaSatuan: 185000, subtotal: 185000 }] },
    { kodePesanan: kode(9), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(14), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 35000, ongkir: 25000, pajakPersen: 11, pajakNominal: 3850, totalBayar: 63850, alamatSnapshot: alamatSnap(alamat3), resi: 'JNE009', buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti9.jpg', items: [{ idBuku: bukuList[8].idBuku, jumlah: 1, hargaSatuan: 35000, subtotal: 35000 }] },
    { kodePesanan: kode(10), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(16), metodePembayaran: 'qris', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 850000, ongkir: 15000, pajakPersen: 11, pajakNominal: 93500, totalBayar: 958500, alamatSnapshot: alamatSnap(alamat1), resi: 'JNT010', items: [{ idBuku: bukuList[6].idBuku, jumlah: 1, hargaSatuan: 850000, subtotal: 850000 }] },
    { kodePesanan: kode(11), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(18), metodePembayaran: 'cod', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 178000, ongkir: 20000, pajakPersen: 11, pajakNominal: 19580, totalBayar: 217580, alamatSnapshot: alamatSnap(alamat2), resi: 'JNE011', items: [{ idBuku: bukuList[0].idBuku, jumlah: 2, hargaSatuan: 89000, subtotal: 178000 }] },
    { kodePesanan: kode(12), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(20), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 250000, ongkir: 25000, pajakPersen: 11, pajakNominal: 27500, totalBayar: 302500, alamatSnapshot: alamatSnap(alamat3), resi: 'JNE012', buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti12.jpg', items: [{ idBuku: bukuList[9].idBuku, jumlah: 2, hargaSatuan: 125000, subtotal: 250000 }] },
    { kodePesanan: kode(13), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(22), metodePembayaran: 'ewallet', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 95000, ongkir: 15000, pajakPersen: 11, pajakNominal: 10450, totalBayar: 120450, alamatSnapshot: alamatSnap(alamat1), resi: 'SICEPAT013', items: [{ idBuku: bukuList[1].idBuku, jumlah: 1, hargaSatuan: 95000, subtotal: 95000 }] },
    { kodePesanan: kode(14), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(25), metodePembayaran: 'cod', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 109000, ongkir: 20000, pajakPersen: 11, pajakNominal: 11990, totalBayar: 140990, alamatSnapshot: alamatSnap(alamat2), resi: 'JNE014', items: [{ idBuku: bukuList[4].idBuku, jumlah: 1, hargaSatuan: 109000, subtotal: 109000 }] },
    { kodePesanan: kode(15), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(28), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 370000, ongkir: 25000, pajakPersen: 11, pajakNominal: 40700, totalBayar: 435700, alamatSnapshot: alamatSnap(alamat3), resi: 'JNT015', buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti15.jpg', items: [{ idBuku: bukuList[11].idBuku, jumlah: 2, hargaSatuan: 185000, subtotal: 370000 }] },
    { kodePesanan: kode(16), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(32), metodePembayaran: 'qris', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 89000, ongkir: 15000, pajakPersen: 11, pajakNominal: 9790, totalBayar: 113790, alamatSnapshot: alamatSnap(alamat1), resi: 'JNE016', items: [{ idBuku: bukuList[0].idBuku, jumlah: 1, hargaSatuan: 89000, subtotal: 89000 }] },
    { kodePesanan: kode(17), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(38), metodePembayaran: 'cod', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 160000, ongkir: 20000, pajakPersen: 11, pajakNominal: 17600, totalBayar: 197600, alamatSnapshot: alamatSnap(alamat2), resi: 'JNT017', items: [{ idBuku: bukuList[8].idBuku, jumlah: 2, hargaSatuan: 35000, subtotal: 70000 }, { idBuku: bukuList[10].idBuku, jumlah: 1, hargaSatuan: 88000, subtotal: 88000 }] },
    { kodePesanan: kode(18), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(45), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 98000, ongkir: 25000, pajakPersen: 11, pajakNominal: 10780, totalBayar: 133780, alamatSnapshot: alamatSnap(alamat3), resi: 'JNE018', buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti18.jpg', items: [{ idBuku: bukuList[3].idBuku, jumlah: 1, hargaSatuan: 98000, subtotal: 98000 }] },
    { kodePesanan: kode(19), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(52), metodePembayaran: 'ewallet', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 125000, ongkir: 15000, pajakPersen: 11, pajakNominal: 13750, totalBayar: 153750, alamatSnapshot: alamatSnap(alamat1), resi: 'SICEPAT019', items: [{ idBuku: bukuList[9].idBuku, jumlah: 1, hargaSatuan: 125000, subtotal: 125000 }] },
    { kodePesanan: kode(20), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(58), metodePembayaran: 'cod', statusPembayaran: 'terkonfirmasi', statusPesanan: 'selesai', subtotal: 75000, ongkir: 20000, pajakPersen: 11, pajakNominal: 8250, totalBayar: 103250, alamatSnapshot: alamatSnap(alamat2), resi: 'JNE020', items: [{ idBuku: bukuList[7].idBuku, jumlah: 1, hargaSatuan: 75000, subtotal: 75000 }] },

    // === DIPROSES (3 pesanan — baru dikonfirmasi, sedang dikemas) ===
    { kodePesanan: kode(21), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(0), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'diproses', subtotal: 95000, ongkir: 15000, pajakPersen: 11, pajakNominal: 10450, totalBayar: 120450, alamatSnapshot: alamatSnap(alamat1), buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti21.jpg', items: [{ idBuku: bukuList[5].idBuku, jumlah: 1, hargaSatuan: 95000, subtotal: 95000 }] },
    { kodePesanan: kode(22), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(0), metodePembayaran: 'cod', statusPembayaran: 'terkonfirmasi', statusPesanan: 'diproses', subtotal: 89000, ongkir: 25000, pajakPersen: 11, pajakNominal: 9790, totalBayar: 123790, alamatSnapshot: alamatSnap(alamat3), items: [{ idBuku: bukuList[0].idBuku, jumlah: 1, hargaSatuan: 89000, subtotal: 89000 }] },
    { kodePesanan: kode(23), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(1), metodePembayaran: 'ewallet', statusPembayaran: 'terkonfirmasi', statusPesanan: 'diproses', subtotal: 185000, ongkir: 20000, pajakPersen: 11, pajakNominal: 20350, totalBayar: 225350, alamatSnapshot: alamatSnap(alamat2), items: [{ idBuku: bukuList[11].idBuku, jumlah: 1, hargaSatuan: 185000, subtotal: 185000 }] },

    // === DIKIRIM (2 pesanan — sedang dalam pengiriman) ===
    { kodePesanan: kode(24), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(3), metodePembayaran: 'transfer_bank', statusPembayaran: 'terkonfirmasi', statusPesanan: 'dikirim', subtotal: 218000, ongkir: 15000, pajakPersen: 11, pajakNominal: 23980, totalBayar: 256980, alamatSnapshot: alamatSnap(alamat1), resi: 'JNE024', buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti24.jpg', items: [{ idBuku: bukuList[4].idBuku, jumlah: 2, hargaSatuan: 109000, subtotal: 218000 }] },
    { kodePesanan: kode(25), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(4), metodePembayaran: 'cod', statusPembayaran: 'terkonfirmasi', statusPesanan: 'dikirim', subtotal: 125000, ongkir: 25000, pajakPersen: 11, pajakNominal: 13750, totalBayar: 163750, alamatSnapshot: alamatSnap(alamat3), resi: 'JNT025', items: [{ idBuku: bukuList[2].idBuku, jumlah: 1, hargaSatuan: 125000, subtotal: 125000 }] },

    // === MENUNGGU PEMBAYARAN (2 pesanan — user belum bayar transfer) ===
    { kodePesanan: kode(26), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(0), metodePembayaran: 'transfer_bank', statusPembayaran: 'belum_dibayar', statusPesanan: 'menunggu_pembayaran', subtotal: 95000, ongkir: 20000, pajakPersen: 11, pajakNominal: 10450, totalBayar: 125450, alamatSnapshot: alamatSnap(alamat2), items: [{ idBuku: bukuList[1].idBuku, jumlah: 1, hargaSatuan: 95000, subtotal: 95000 }] },
    { kodePesanan: kode(27), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(1), metodePembayaran: 'transfer_bank', statusPembayaran: 'belum_dibayar', statusPesanan: 'menunggu_pembayaran', subtotal: 89000, ongkir: 15000, pajakPersen: 11, pajakNominal: 9790, totalBayar: 113790, alamatSnapshot: alamatSnap(alamat1), items: [{ idBuku: bukuList[0].idBuku, jumlah: 1, hargaSatuan: 89000, subtotal: 89000 }] },

    // === MENUNGGU VERIFIKASI (2 pesanan — bukti sudah upload, admin belum cek) ===
    { kodePesanan: kode(28), idUser: user3.idUser, idAlamat: alamat3.idAlamat, tanggalPesan: daysAgo(0), metodePembayaran: 'transfer_bank', statusPembayaran: 'menunggu_konfirmasi', statusPesanan: 'menunggu_verifikasi', subtotal: 185000, ongkir: 25000, pajakPersen: 11, pajakNominal: 20350, totalBayar: 230350, alamatSnapshot: alamatSnap(alamat3), buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti28.jpg', items: [{ idBuku: bukuList[11].idBuku, jumlah: 1, hargaSatuan: 185000, subtotal: 185000 }] },
    { kodePesanan: kode(29), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(1), metodePembayaran: 'transfer_bank', statusPembayaran: 'menunggu_konfirmasi', statusPesanan: 'menunggu_verifikasi', subtotal: 109000, ongkir: 20000, pajakPersen: 11, pajakNominal: 11990, totalBayar: 140990, alamatSnapshot: alamatSnap(alamat2), buktiPembayaranUrl: '/uploads/bukti-pembayaran/bukti29.jpg', items: [{ idBuku: bukuList[4].idBuku, jumlah: 1, hargaSatuan: 109000, subtotal: 109000 }] },

    // === DIBATALKAN (2 pesanan) ===
    { kodePesanan: kode(30), idUser: user1.idUser, idAlamat: alamat1.idAlamat, tanggalPesan: daysAgo(6), metodePembayaran: 'transfer_bank', statusPembayaran: 'dibatalkan', statusPesanan: 'dibatalkan', subtotal: 75000, ongkir: 15000, pajakPersen: 11, pajakNominal: 8250, totalBayar: 98250, alamatSnapshot: alamatSnap(alamat1), items: [{ idBuku: bukuList[7].idBuku, jumlah: 1, hargaSatuan: 75000, subtotal: 75000 }] },
    { kodePesanan: kode(31), idUser: user2.idUser, idAlamat: alamat2.idAlamat, tanggalPesan: daysAgo(15), metodePembayaran: 'ewallet', statusPembayaran: 'dibatalkan', statusPesanan: 'dibatalkan', subtotal: 35000, ongkir: 20000, pajakPersen: 11, pajakNominal: 3850, totalBayar: 58850, alamatSnapshot: alamatSnap(alamat2), items: [{ idBuku: bukuList[8].idBuku, jumlah: 1, hargaSatuan: 35000, subtotal: 35000 }] },
  ];

  for (const p of pesananList) {
    await prisma.pesanan.create({
      data: {
        kodePesanan: p.kodePesanan,
        idUser: p.idUser,
        idAlamat: p.idAlamat,
        tanggalPesan: p.tanggalPesan,
        metodePembayaran: p.metodePembayaran,
        statusPembayaran: p.statusPembayaran,
        statusPesanan: p.statusPesanan,
        subtotal: p.subtotal,
        ongkir: p.ongkir,
        pajakPersen: p.pajakPersen,
        pajakNominal: p.pajakNominal,
        totalBayar: p.totalBayar,
        alamatSnapshot: p.alamatSnapshot,
        resi: p.resi || null,
        buktiPembayaranUrl: p.buktiPembayaranUrl || null,
        detailPesanan: {
          create: p.items,
        },
      },
    });
  }
  console.log(`✅ ${pesananList.length} pesanan berhasil dibuat`);

  // ============================================================
  // 8. PENGELUARAN (untuk laporan income vs expense)
  // ============================================================
  console.log('💸 Membuat pengeluaran...');
  const pengeluaranData = [
    { judul: 'Pembelian stok buku baru', nominal: 2500000, keterangan: 'Restock 50 buku dari distributor', tanggal: daysAgo(2) },
    { judul: 'Biaya kurir bulanan', nominal: 350000, keterangan: 'Langganan pick-up JNE bulan ini', tanggal: daysAgo(5) },
    { judul: 'Biaya packaging', nominal: 150000, keterangan: 'Kardus dan bubble wrap', tanggal: daysAgo(8) },
    { judul: 'Gaji karyawan gudang', nominal: 3000000, keterangan: 'Gaji bulan ini', tanggal: daysAgo(10) },
    { judul: 'Maintenance website', nominal: 200000, keterangan: 'Biaya hosting dan domain', tanggal: daysAgo(15) },
    { judul: 'Iklan media sosial', nominal: 500000, keterangan: 'Promo Instagram & Facebook Ads', tanggal: daysAgo(20) },
    { judul: 'Pembelian stok buku', nominal: 1800000, keterangan: 'Restock 30 buku populer', tanggal: daysAgo(25) },
    { judul: 'Biaya listrik & internet', nominal: 450000, keterangan: 'Tagihan bulanan gudang', tanggal: daysAgo(30) },
    { judul: 'ATK & kebutuhan kantor', nominal: 175000, keterangan: 'Printer, tinta, kertas', tanggal: daysAgo(35) },
    { judul: 'Biaya kurir bulanan', nominal: 350000, keterangan: 'Langganan pick-up JNE bulan lalu', tanggal: daysAgo(40) },
    { judul: 'Pembelian stok buku', nominal: 2000000, keterangan: 'Restock buku pendidikan', tanggal: daysAgo(50) },
    { judul: 'Biaya event pameran buku', nominal: 750000, keterangan: 'Booth di pameran buku Jakarta', tanggal: daysAgo(55) },
  ];

  for (const p of pengeluaranData) {
    await prisma.pengeluaran.create({ data: p });
  }
  console.log(`✅ ${pengeluaranData.length} pengeluaran berhasil dibuat`);

  // ============================================================
  // 9. ULASAN BUKU
  // ============================================================
  console.log('⭐ Membuat ulasan buku...');
  const ulasanData = [
    { idBuku: bukuList[0].idBuku, idUser: user1.idUser, rating: 5, komentar: 'Buku yang sangat menginspirasi! Wajib baca.', tanggalUlasan: daysAgo(3) },
    { idBuku: bukuList[1].idBuku, idUser: user1.idUser, rating: 5, komentar: 'Karya sastra yang luar biasa.', tanggalUlasan: daysAgo(4) },
    { idBuku: bukuList[2].idBuku, idUser: user2.idUser, rating: 4, komentar: 'Perspektif yang menarik tentang sejarah manusia.', tanggalUlasan: daysAgo(5) },
    { idBuku: bukuList[4].idBuku, idUser: user3.idUser, rating: 5, komentar: 'Buku terbaik tentang kebiasaan! Sangat rekomendasi.', tanggalUlasan: daysAgo(6) },
    { idBuku: bukuList[3].idBuku, idUser: user2.idUser, rating: 4, komentar: 'Stoicism yang dikemas ringan dan modern.', tanggalUlasan: daysAgo(10) },
    { idBuku: bukuList[5].idBuku, idUser: user1.idUser, rating: 4, komentar: 'Sangat membantu untuk meningkatkan fokus.', tanggalUlasan: daysAgo(12) },
    { idBuku: bukuList[11].idBuku, idUser: user2.idUser, rating: 5, komentar: 'Wajib baca untuk setiap programmer!', tanggalUlasan: daysAgo(14) },
    { idBuku: bukuList[10].idBuku, idUser: user3.idUser, rating: 4, komentar: 'Ceritanya menyentuh hati.', tanggalUlasan: daysAgo(18) },
  ];

  for (const u of ulasanData) {
    await prisma.ulasanBuku.create({ data: u });
  }
  console.log(`✅ ${ulasanData.length} ulasan berhasil dibuat`);

  // ============================================================
  // 10. NOTIFIKASI ADMIN
  // ============================================================
  console.log('🔔 Membuat notifikasi admin...');
  // Get the "menunggu" orders for notifications
  const menungguOrders = pesananList.filter(p =>
    p.statusPesanan === 'menunggu_pembayaran' || p.statusPesanan === 'menunggu_verifikasi' || p.statusPesanan === 'diproses'
  );

  const allPesanan = await prisma.pesanan.findMany({ orderBy: { idPesanan: 'desc' }, take: 10, include: { user: true } });
  for (const p of allPesanan.slice(0, 7)) {
    await prisma.notifikasiAdmin.create({
      data: {
        idPesanan: p.idPesanan,
        tipe: 'pesanan_baru',
        pesan: `Pesanan baru #${p.kodePesanan} dari ${p.user.namaLengkap}`,
        sudahDibaca: false,
        tanggalNotifikasi: p.tanggalPesan,
      },
    });
  }
  console.log('✅ Notifikasi admin berhasil dibuat');

  // ============================================================
  // 11. PESAN KONTAK
  // ============================================================
  console.log('✉️ Membuat pesan kontak...');
  await prisma.pesanKontak.createMany({
    data: [
      { namaLengkap: 'Ahmad Rizky', email: 'ahmad@example.com', subjek: 'Pertanyaan tentang stok buku', isiPesan: 'Halo admin, apakah buku Harry Potter akan restock dalam waktu dekat?', tanggalKirim: daysAgo(1) },
      { namaLengkap: 'Diana Putri', email: 'diana@example.com', subjek: 'Cara pengembalian buku', isiPesan: 'Saya menerima buku dalam kondisi rusak, bagaimana cara pengembalian?', tanggalKirim: daysAgo(3) },
    ],
  });

  console.log('\n✨ Seeding selesai!');
  console.log('\n📊 Data Summary:');
  console.log('   - 4 users (1 admin + 3 user)');
  console.log('   - 6 kategori buku');
  console.log('   - 12 buku');
  console.log('   - 31 pesanan (20 selesai, 3 diproses, 2 dikirim, 2 menunggu pembayaran, 2 menunggu verifikasi, 2 dibatalkan)');
  console.log('   - 12 pengeluaran');
  console.log('   - 8 ulasan buku');
  console.log('\n📝 Kredensial Login:');
  console.log('   Admin: admin / admin123');
  console.log('   User : johndoe / user123');
  console.log('   User : sitirahma / user123');
  console.log('   User : budisantoso / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
