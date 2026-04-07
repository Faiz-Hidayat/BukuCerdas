import { z } from 'zod';

/** Schema validasi untuk kategori buku */
export const kategoriSchema = z.object({
  namaKategori: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  deskripsi: z.string().optional(),
});
