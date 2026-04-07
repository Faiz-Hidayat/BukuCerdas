import imageCompression from 'browser-image-compression';

/**
 * Compress gambar di client-side sebelum upload (H2).
 * Target: ≤ 1MB, max width 1920px, kualitas 0.8
 */
export async function compressImage(file: File): Promise<File> {
  // Hanya compress file gambar
  if (!file.type.startsWith('image/')) return file;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    initialQuality: 0.8,
    useWebWorker: true,
  };

  const compressed = await imageCompression(file, options);

  // H3: Safety net — jika masih > 2MB, tolak
  if (compressed.size > 2 * 1024 * 1024) {
    throw new Error('Gambar terlalu besar setelah kompresi. Gunakan gambar yang lebih kecil.');
  }

  return compressed;
}
