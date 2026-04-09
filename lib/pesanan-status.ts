/**
 * Mapping transisi status pesanan yang diizinkan.
 * Sesuai PRD Section 12.8.
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  menunggu_pembayaran: ['menunggu_verifikasi', 'dibatalkan'],
  menunggu_verifikasi: ['diproses', 'menunggu_pembayaran', 'dibatalkan'],
  menunggu_konfirmasi: ['diproses', 'dibatalkan'], // backward compat
  diproses: ['dikirim', 'dibatalkan'],
  dikirim: ['dibatalkan'], // selesai is exclusively for users
  selesai: [], // status final
  dibatalkan: [], // status final
};

/**
 * Cek apakah transisi status valid
 */
export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Cek apakah status adalah status final (tidak bisa diubah lagi)
 */
export function isFinalStatus(status: string): boolean {
  return ['selesai', 'dibatalkan'].includes(status);
}
