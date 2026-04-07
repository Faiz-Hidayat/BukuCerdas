import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

/** Daftar MIME type yang diizinkan untuk upload gambar */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB safety net

/**
 * Validasi file upload: cek MIME type dan ukuran
 * Return pesan error atau null jika valid
 */
export function validateUploadFile(
  file: File,
  options?: {
    allowedTypes?: string[];
    maxSize?: number;
  },
): string | null {
  const allowedTypes = options?.allowedTypes || ALLOWED_IMAGE_TYPES;
  const maxSize = options?.maxSize || MAX_FILE_SIZE;

  if (!allowedTypes.includes(file.type)) {
    return `Tipe file tidak diizinkan. Gunakan: ${allowedTypes.join(', ')}`;
  }

  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    return `Ukuran file terlalu besar. Maksimal ${maxMB}MB`;
  }

  return null;
}

export async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create unique filename
  const timestamp = Date.now();
  // Sanitize filename
  const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const filename = `${timestamp}-${originalName}`;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore if exists
  }

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return `/uploads/${folder}/${filename}`;
}

/**
 * Hapus file dari public/uploads jika ada (H6)
 */
export async function deleteOldFile(filePath: string | null | undefined) {
  if (!filePath) return;
  // Hanya hapus file lokal (di /uploads/)
  if (!filePath.startsWith('/uploads/')) return;
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await unlink(fullPath);
  } catch {
    // File mungkin sudah tidak ada, lanjutkan
  }
}
