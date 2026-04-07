import { z } from 'zod';

/** Schema validasi untuk checkout */
export const checkoutSchema = z.object({
  idAlamat: z.number().int().positive('Pilih alamat pengiriman'),
  metodePembayaran: z.enum(['cod', 'transfer_bank', 'ewallet', 'qris'], {
    error: 'Metode pembayaran tidak valid',
  }),
});
