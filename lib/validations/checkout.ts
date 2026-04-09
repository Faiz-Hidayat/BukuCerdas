import { z } from 'zod';

/** Schema validasi untuk checkout */
export const checkoutSchema = z.object({
  idAlamat: z.number().int().positive('Pilih alamat pengiriman'),
  metodePembayaran: z.enum(['transfer_bank', 'ewallet', 'qris', 'midtrans'], {
    error: 'Metode pembayaran tidak valid',
  }),
  selectedItems: z.array(z.number().int()).optional(),
});
