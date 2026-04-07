import { z } from 'zod';

/** Schema validasi untuk update status pesanan oleh admin */
export const updatePesananSchema = z.object({
  statusPembayaran: z.enum(['belum_dibayar', 'menunggu_konfirmasi', 'terkonfirmasi', 'dibatalkan']).optional(),
  statusPesanan: z.enum(['menunggu_pembayaran', 'menunggu_verifikasi', 'menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan']).optional(),
  resi: z.string().min(1, 'Nomor resi tidak boleh kosong').optional(),
});
