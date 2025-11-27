-- AlterTable
ALTER TABLE `pengaturan_toko` ADD COLUMN `aktif_cod` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `aktif_ewallet` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `aktif_qris` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `aktif_transfer` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `pengeluaran` (
    `id_pengeluaran` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(255) NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,
    `keterangan` TEXT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_pengeluaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
