import { z } from 'zod';

/** Schema validasi untuk form kontak */
export const kontakSchema = z.object({
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi').max(255),
  email: z.string().email('Format email tidak valid'),
  subjek: z.string().min(1, 'Subjek wajib diisi').max(255),
  isiPesan: z.string().min(1, 'Isi pesan wajib diisi').max(2000),
});
