-- CreateTable
CREATE TABLE `user` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_lengkap` VARCHAR(255) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `kata_sandi_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    `foto_profil_url` VARCHAR(500) NULL,
    `nomor_telepon` VARCHAR(20) NULL,
    `tanggal_daftar` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status_akun` ENUM('aktif', 'nonaktif', 'suspended') NOT NULL DEFAULT 'aktif',

    UNIQUE INDEX `user_username_key`(`username`),
    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori_buku` (
    `id_kategori` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kategori` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,

    PRIMARY KEY (`id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buku` (
    `id_buku` INTEGER NOT NULL AUTO_INCREMENT,
    `id_kategori` INTEGER NOT NULL,
    `judul` VARCHAR(255) NOT NULL,
    `pengarang` VARCHAR(255) NOT NULL,
    `penerbit` VARCHAR(255) NOT NULL,
    `tahun_terbit` INTEGER NOT NULL,
    `isbn` VARCHAR(20) NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `harga` DECIMAL(10, 2) NOT NULL,
    `sinopsis` TEXT NULL,
    `cover_url` VARCHAR(500) NULL,
    `status_aktif` BOOLEAN NOT NULL DEFAULT true,
    `tanggal_dibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `buku_isbn_key`(`isbn`),
    INDEX `buku_id_kategori_idx`(`id_kategori`),
    PRIMARY KEY (`id_buku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alamat_user` (
    `id_alamat` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `nama_penerima` VARCHAR(255) NOT NULL,
    `nomor_telepon` VARCHAR(20) NOT NULL,
    `kota` VARCHAR(100) NOT NULL,
    `provinsi` VARCHAR(100) NOT NULL,
    `alamat_lengkap` TEXT NOT NULL,
    `kode_pos` VARCHAR(10) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,

    INDEX `alamat_user_id_user_idx`(`id_user`),
    PRIMARY KEY (`id_alamat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pesanan` (
    `id_pesanan` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_pesanan` VARCHAR(50) NOT NULL,
    `id_user` INTEGER NOT NULL,
    `id_alamat` INTEGER NOT NULL,
    `tanggal_pesan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metode_pembayaran` ENUM('cod', 'transfer_bank', 'ewallet', 'qris') NOT NULL,
    `status_pembayaran` ENUM('menunggu_konfirmasi', 'terkonfirmasi', 'dibatalkan') NOT NULL DEFAULT 'menunggu_konfirmasi',
    `status_pesanan` ENUM('diproses', 'dikirim', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'diproses',
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `ongkir` DECIMAL(10, 2) NOT NULL,
    `pajak_persen` DECIMAL(5, 2) NOT NULL,
    `pajak_nominal` DECIMAL(10, 2) NOT NULL,
    `total_bayar` DECIMAL(10, 2) NOT NULL,
    `bukti_pembayaran_url` VARCHAR(500) NULL,

    UNIQUE INDEX `pesanan_kode_pesanan_key`(`kode_pesanan`),
    INDEX `pesanan_id_user_idx`(`id_user`),
    INDEX `pesanan_id_alamat_idx`(`id_alamat`),
    PRIMARY KEY (`id_pesanan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_pesanan` (
    `id_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pesanan` INTEGER NOT NULL,
    `id_buku` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `harga_satuan` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `detail_pesanan_id_pesanan_idx`(`id_pesanan`),
    INDEX `detail_pesanan_id_buku_idx`(`id_buku`),
    PRIMARY KEY (`id_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ulasan_buku` (
    `id_ulasan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_buku` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `rating` TINYINT NOT NULL,
    `komentar` TEXT NULL,
    `tanggal_ulasan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ulasan_buku_id_buku_idx`(`id_buku`),
    INDEX `ulasan_buku_id_user_idx`(`id_user`),
    PRIMARY KEY (`id_ulasan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifikasi_admin` (
    `id_notifikasi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pesanan` INTEGER NULL,
    `tipe` ENUM('pesanan_baru', 'pembayaran_baru', 'pesanan_selesai') NOT NULL,
    `pesan` TEXT NOT NULL,
    `sudah_dibaca` BOOLEAN NOT NULL DEFAULT false,
    `tanggal_notifikasi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifikasi_admin_id_pesanan_idx`(`id_pesanan`),
    PRIMARY KEY (`id_notifikasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengaturan_toko` (
    `id_pengaturan` INTEGER NOT NULL AUTO_INCREMENT,
    `pajak_persen` DECIMAL(5, 2) NOT NULL,
    `nomor_rekening` VARCHAR(50) NULL,
    `nomor_ewallet` VARCHAR(50) NULL,
    `qris_url` VARCHAR(500) NULL,

    PRIMARY KEY (`id_pengaturan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarif_ongkir` (
    `id_tarif` INTEGER NOT NULL AUTO_INCREMENT,
    `kota_tujuan` VARCHAR(100) NOT NULL,
    `zona` VARCHAR(50) NOT NULL,
    `biaya_ongkir` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id_tarif`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pesan_kontak` (
    `id_pesan` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_lengkap` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `subjek` VARCHAR(255) NOT NULL,
    `isi_pesan` TEXT NOT NULL,
    `tanggal_kirim` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_pesan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `buku` ADD CONSTRAINT `buku_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `kategori_buku`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alamat_user` ADD CONSTRAINT `alamat_user_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pesanan` ADD CONSTRAINT `pesanan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pesanan` ADD CONSTRAINT `pesanan_id_alamat_fkey` FOREIGN KEY (`id_alamat`) REFERENCES `alamat_user`(`id_alamat`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pesanan` ADD CONSTRAINT `detail_pesanan_id_pesanan_fkey` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan`(`id_pesanan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pesanan` ADD CONSTRAINT `detail_pesanan_id_buku_fkey` FOREIGN KEY (`id_buku`) REFERENCES `buku`(`id_buku`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ulasan_buku` ADD CONSTRAINT `ulasan_buku_id_buku_fkey` FOREIGN KEY (`id_buku`) REFERENCES `buku`(`id_buku`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ulasan_buku` ADD CONSTRAINT `ulasan_buku_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifikasi_admin` ADD CONSTRAINT `notifikasi_admin_id_pesanan_fkey` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan`(`id_pesanan`) ON DELETE SET NULL ON UPDATE CASCADE;
