/* eslint-disable @typescript-eslint/no-require-imports */
import crypto from 'crypto';

// midtrans-client tidak punya type declarations
const midtransClient = require('midtrans-client');

/** Midtrans Snap client (singleton) */
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

/**
 * Generate Midtrans Snap token untuk pembayaran (G2).
 * Hanya dipanggil untuk metode ewallet/qris.
 */
export async function createSnapTransaction(params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}) {
  const parameter = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    item_details: params.items,
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
    },
  };

  const transaction = await snap.createTransaction(parameter);
  return {
    snapToken: transaction.token as string,
    redirectUrl: transaction.redirect_url as string,
  };
}

/**
 * Verifikasi signature webhook notification dari Midtrans (G3).
 * Signature = SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifySignature(notification: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const input =
    notification.order_id +
    notification.status_code +
    notification.gross_amount +
    serverKey;
  const expectedSignature = crypto
    .createHash('sha512')
    .update(input)
    .digest('hex');
  return expectedSignature === notification.signature_key;
}

/**
 * Ambil status transaksi dari Midtrans via GET Status API.
 * Endpoint: GET /v2/{orderId}/status
 * Digunakan sebagai fallback ketika webhook tidak bisa diakses (localhost dev).
 */
export async function getTransactionStatus(orderId: string) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const baseUrl = isProduction
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';

  const response = await fetch(`${baseUrl}/v2/${orderId}/status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Midtrans GET Status gagal (${response.status}): ${text}`);
  }

  return response.json() as Promise<{
    transaction_status: string;
    fraud_status?: string;
    status_code: string;
    order_id: string;
    gross_amount: string;
    signature_key?: string;
    payment_type?: string;
  }>;
}

export type MidtransStatusMapping = {
  statusPesanan: 'diproses' | 'dibatalkan' | null;
  statusPembayaran: 'terkonfirmasi' | 'dibatalkan' | null;
  shouldRestoreStock: boolean;
  skip: boolean;
  message: string;
};

/**
 * Mapping status Midtrans → status pesanan BukuCerdas.
 * Dipakai bersama oleh webhook callback dan check-status API.
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): MidtransStatusMapping {
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') {
      return { statusPesanan: 'diproses', statusPembayaran: 'terkonfirmasi', shouldRestoreStock: false, skip: false, message: 'Pembayaran berhasil (capture+accept)' };
    }
    // fraud_status = challenge/deny
    return { statusPesanan: 'dibatalkan', statusPembayaran: 'dibatalkan', shouldRestoreStock: true, skip: false, message: `Pembayaran ditolak (capture+${fraudStatus})` };
  }

  if (transactionStatus === 'settlement') {
    return { statusPesanan: 'diproses', statusPembayaran: 'terkonfirmasi', shouldRestoreStock: false, skip: false, message: 'Pembayaran berhasil (settlement)' };
  }

  if (transactionStatus === 'pending') {
    return { statusPesanan: null, statusPembayaran: null, shouldRestoreStock: false, skip: true, message: 'Pembayaran masih pending' };
  }

  if (['deny', 'cancel', 'expire', 'failure'].includes(transactionStatus)) {
    return { statusPesanan: 'dibatalkan', statusPembayaran: 'dibatalkan', shouldRestoreStock: true, skip: false, message: `Pembayaran gagal (${transactionStatus})` };
  }

  // refund, chargeback, dll — skip
  return { statusPesanan: null, statusPembayaran: null, shouldRestoreStock: false, skip: true, message: `Status "${transactionStatus}" tidak dihandle` };
}

/** Client key publik untuk frontend Snap JS embed */
export function getClientKey(): string {
  return process.env.MIDTRANS_CLIENT_KEY || '';
}
