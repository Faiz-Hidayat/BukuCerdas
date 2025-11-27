-- CreateTable
CREATE TABLE `keranjang` (
    `id_keranjang` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `tanggal_update` DATETIME(3) NOT NULL,

    UNIQUE INDEX `keranjang_id_user_key`(`id_user`),
    PRIMARY KEY (`id_keranjang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_keranjang` (
    `id_item` INTEGER NOT NULL AUTO_INCREMENT,
    `id_keranjang` INTEGER NOT NULL,
    `id_buku` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL DEFAULT 1,
    `tanggal_ditambahkan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `item_keranjang_id_keranjang_idx`(`id_keranjang`),
    INDEX `item_keranjang_id_buku_idx`(`id_buku`),
    PRIMARY KEY (`id_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `keranjang` ADD CONSTRAINT `keranjang_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_keranjang` ADD CONSTRAINT `item_keranjang_id_keranjang_fkey` FOREIGN KEY (`id_keranjang`) REFERENCES `keranjang`(`id_keranjang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_keranjang` ADD CONSTRAINT `item_keranjang_id_buku_fkey` FOREIGN KEY (`id_buku`) REFERENCES `buku`(`id_buku`) ON DELETE RESTRICT ON UPDATE CASCADE;
