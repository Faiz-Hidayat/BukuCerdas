/*
  Warnings:

  - A unique constraint covering the columns `[midtrans_order_id]` on the table `pesanan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `pesanan` ADD COLUMN `alamat_snapshot` TEXT NULL,
    ADD COLUMN `midtrans_order_id` VARCHAR(100) NULL,
    ADD COLUMN `resi` VARCHAR(50) NULL,
    MODIFY `status_pesanan` ENUM('menunggu_pembayaran', 'menunggu_verifikasi', 'menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'diproses';

-- CreateIndex
CREATE UNIQUE INDEX `pesanan_midtrans_order_id_key` ON `pesanan`(`midtrans_order_id`);
