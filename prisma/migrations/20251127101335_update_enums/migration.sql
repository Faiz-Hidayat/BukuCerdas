-- AlterTable
ALTER TABLE `pesanan` MODIFY `status_pembayaran` ENUM('belum_dibayar', 'menunggu_konfirmasi', 'terkonfirmasi', 'dibatalkan') NOT NULL DEFAULT 'menunggu_konfirmasi',
    MODIFY `status_pesanan` ENUM('menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'diproses';
