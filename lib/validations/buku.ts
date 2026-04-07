import { z } from 'zod';

/** Schema validasi untuk membuat/edit buku */
export const bukuSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').max(255),
  pengarang: z.string().min(1, 'Pengarang wajib diisi').max(255),
  penerbit: z.string().min(1, 'Penerbit wajib diisi').max(255),
  tahunTerbit: z.number().int().min(1900, 'Tahun tidak valid').max(new Date().getFullYear(), 'Tahun tidak boleh di masa depan'), // B7
  harga: z.number().positive('Harga harus lebih dari 0'), // B3
  stok: z.number().int().nonnegative('Stok tidak boleh negatif'), // B4
  idKategori: z.number().int().positive('Kategori wajib dipilih'),
  sinopsis: z.string().optional(),
  isbn: z.string().max(20).optional(),
});
