import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database BukuCerdas...');

  // 1. Buat admin default
  console.log('👤 Membuat user admin...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      namaLengkap: 'Administrator BukuCerdas',
      username: 'admin',
      email: 'admin@bukucerdas.com',
      kataSandiHash: adminPassword,
      role: 'admin',
      nomorTelepon: '081234567890',
      statusAkun: 'aktif',
    },
  });
  console.log('✅ Admin berhasil dibuat:', admin.username);

  // 2. Buat beberapa user contoh
  console.log('👥 Membuat user contoh...');
  const userPassword = await bcrypt.hash('user123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { username: 'johndoe' },
    update: {},
    create: {
      namaLengkap: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      kataSandiHash: userPassword,
      role: 'user',
      nomorTelepon: '081298765432',
      statusAkun: 'aktif',
    },
  });
  console.log('✅ User berhasil dibuat:', user1.username);

  // 3. Buat kategori buku
  console.log('📚 Membuat kategori buku...');
  const kategoriFiksi = await prisma.kategoriBuku.upsert({
    where: { idKategori: 1 },
    update: {},
    create: {
      namaKategori: 'Fiksi',
      deskripsi: 'Novel, cerita pendek, dan karya fiksi lainnya',
    },
  });

  const kategoriNonFiksi = await prisma.kategoriBuku.upsert({
    where: { idKategori: 2 },
    update: {},
    create: {
      namaKategori: 'Non-Fiksi',
      deskripsi: 'Buku pengetahuan, biografi, dan referensi',
    },
  });

  const kategoriPendidikan = await prisma.kategoriBuku.upsert({
    where: { idKategori: 3 },
    update: {},
    create: {
      namaKategori: 'Pendidikan',
      deskripsi: 'Buku pelajaran, panduan belajar, dan materi akademik',
    },
  });

  const kategoriReligius = await prisma.kategoriBuku.upsert({
    where: { idKategori: 4 },
    update: {},
    create: {
      namaKategori: 'Religius',
      deskripsi: 'Buku agama, spiritual, dan keagamaan',
    },
  });

  const kategoriAnakAnak = await prisma.kategoriBuku.upsert({
    where: { idKategori: 5 },
    update: {},
    create: {
      namaKategori: 'Anak-Anak',
      deskripsi: 'Buku cerita dan pembelajaran untuk anak',
    },
  });

  console.log('✅ 5 kategori berhasil dibuat');

  // 4. Buat buku contoh
  console.log('📖 Membuat buku contoh...');
  
  const bukuList = [
    {
      idKategori: kategoriFiksi.idKategori,
      judul: 'Laskar Pelangi',
      pengarang: 'Andrea Hirata',
      penerbit: 'Bentang Pustaka',
      tahunTerbit: 2005,
      isbn: '9789793062792',
      stok: 25,
      harga: 89000,
      sinopsis: 'Novel tentang kehidupan anak-anak di Belitung yang berjuang untuk mendapatkan pendidikan layak.',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriFiksi.idKategori,
      judul: 'Bumi Manusia',
      pengarang: 'Pramoedya Ananta Toer',
      penerbit: 'Hasta Mitra',
      tahunTerbit: 1980,
      isbn: '9789799101129',
      stok: 15,
      harga: 95000,
      sinopsis: 'Novel pertama dari Tetralogi Buru yang mengisahkan perjalanan Minke dalam menghadapi kolonialisme.',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriNonFiksi.idKategori,
      judul: 'Sapiens: Riwayat Singkat Umat Manusia',
      pengarang: 'Yuval Noah Harari',
      penerbit: 'KPG',
      tahunTerbit: 2017,
      isbn: '9786024246945',
      stok: 30,
      harga: 125000,
      sinopsis: 'Sejarah manusia dari zaman batu hingga era modern dengan perspektif yang unik.',
      coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriNonFiksi.idKategori,
      judul: 'Filosofi Teras',
      pengarang: 'Henry Manampiring',
      penerbit: 'Penerbit Buku Kompas',
      tahunTerbit: 2019,
      isbn: '9786024812058',
      stok: 40,
      harga: 98000,
      sinopsis: 'Pengantar filsafat Stoic untuk menghadapi tantangan kehidupan modern.',
      coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriPendidikan.idKategori,
      judul: 'Atomic Habits',
      pengarang: 'James Clear',
      penerbit: 'Gramedia',
      tahunTerbit: 2019,
      isbn: '9786020633176',
      stok: 50,
      harga: 109000,
      sinopsis: 'Panduan praktis membangun kebiasaan baik dan menghilangkan kebiasaan buruk.',
      coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriPendidikan.idKategori,
      judul: 'Deep Work',
      pengarang: 'Cal Newport',
      penerbit: 'Bentang Pustaka',
      tahunTerbit: 2018,
      isbn: '9786022914433',
      stok: 20,
      harga: 95000,
      sinopsis: 'Strategi untuk fokus tanpa gangguan di dunia yang penuh distraksi.',
      coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriReligius.idKategori,
      judul: 'Tafsir Al-Misbah',
      pengarang: 'M. Quraish Shihab',
      penerbit: 'Lentera Hati',
      tahunTerbit: 2002,
      isbn: '9789799923196',
      stok: 12,
      harga: 850000,
      sinopsis: 'Tafsir Al-Quran lengkap dalam bahasa Indonesia dengan pendekatan kontemporer.',
      coverUrl: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriReligius.idKategori,
      judul: 'Jangan Bersedih',
      pengarang: 'Aidh bin Abdullah al-Qarni',
      penerbit: 'Qisthi Press',
      tahunTerbit: 2004,
      isbn: '9789797567064',
      stok: 35,
      harga: 75000,
      sinopsis: 'Motivasi dan nasihat islami untuk menghadapi kesedihan dalam hidup.',
      coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriAnakAnak.idKategori,
      judul: 'Si Kancil dan Buaya',
      pengarang: 'Cerita Rakyat Nusantara',
      penerbit: 'Erlangga for Kids',
      tahunTerbit: 2015,
      isbn: '9786024340377',
      stok: 45,
      harga: 35000,
      sinopsis: 'Cerita rakyat klasik tentang kecerdikan Si Kancil menghadapi buaya.',
      coverUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriAnakAnak.idKategori,
      judul: 'Ensiklopedia Dinosaurus untuk Anak',
      pengarang: 'Tim Penulis BIP',
      penerbit: 'BIP',
      tahunTerbit: 2020,
      isbn: '9786024834524',
      stok: 28,
      harga: 125000,
      sinopsis: 'Ensiklopedia lengkap tentang dinosaurus dengan ilustrasi menarik untuk anak.',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriFiksi.idKategori,
      judul: 'Perahu Kertas',
      pengarang: 'Dee Lestari',
      penerbit: 'Bentang Pustaka',
      tahunTerbit: 2009,
      isbn: '9789793062853',
      stok: 22,
      harga: 88000,
      sinopsis: 'Novel romantis tentang dua anak muda yang mengejar impian mereka.',
      coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
      statusAktif: true,
    },
    {
      idKategori: kategoriNonFiksi.idKategori,
      judul: 'The Power of Habit',
      pengarang: 'Charles Duhigg',
      penerbit: 'Bentang Pustaka',
      tahunTerbit: 2014,
      isbn: '9786022912071',
      stok: 18,
      harga: 95000,
      sinopsis: 'Mengapa kita melakukan apa yang kita lakukan dalam kehidupan dan bisnis.',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      statusAktif: true,
    },
  ];

  for (const buku of bukuList) {
    await prisma.buku.create({
      data: buku,
    });
  }

  console.log(`✅ ${bukuList.length} buku berhasil dibuat`);

  // 5. Buat pengaturan toko default
  console.log('⚙️ Membuat pengaturan toko...');
  await prisma.pengaturanToko.upsert({
    where: { idPengaturan: 1 },
    update: {},
    create: {
      pajakPersen: 11.0, // PPN 11%
      nomorRekening: '1234567890 (Bank BCA)',
      nomorEwallet: '081234567890 (OVO/GoPay)',
      qrisUrl: 'https://example.com/qris.png',
    },
  });
  console.log('✅ Pengaturan toko berhasil dibuat');

  // 6. Buat tarif ongkir contoh
  console.log('🚚 Membuat tarif ongkir...');
  const tarifOngkir = [
    { kotaTujuan: 'Jakarta', zona: 'A', biayaOngkir: 15000 },
    { kotaTujuan: 'Bandung', zona: 'A', biayaOngkir: 20000 },
    { kotaTujuan: 'Surabaya', zona: 'B', biayaOngkir: 25000 },
    { kotaTujuan: 'Medan', zona: 'C', biayaOngkir: 35000 },
    { kotaTujuan: 'Makassar', zona: 'C', biayaOngkir: 40000 },
  ];

  for (const tarif of tarifOngkir) {
    await prisma.tarifOngkir.create({
      data: tarif,
    });
  }
  console.log(`✅ ${tarifOngkir.length} tarif ongkir berhasil dibuat`);

  console.log('\n✨ Seeding selesai!');
  console.log('\n📝 Kredensial Login:');
  console.log('   Admin:');
  console.log('   - Username: admin');
  console.log('   - Password: admin123');
  console.log('\n   User:');
  console.log('   - Username: johndoe');
  console.log('   - Password: user123');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
