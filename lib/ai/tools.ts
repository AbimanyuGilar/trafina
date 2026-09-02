export const getSalesReport = {
  name: 'get_sales_report',
  description: 'Mengambil laporan/ringkasan penjualan toko. Jika pengguna meminta penjualan keseluruhan/semua data/laporan keseluruhan atau tidak menyebutkan tanggal spesifik, set isAllTime: true. Jika pengguna meminta periode tertentu, tentukan startDate dan endDate (format YYYY-MM-DD).',
  parameters: {
    type: 'object',
    properties: {
      startDate: { type: 'string', description: 'Tanggal awal format YYYY-MM-DD (Opsional)' },
      endDate: { type: 'string', description: 'Tanggal akhir format YYYY-MM-DD (Opsional)' },
      isAllTime: { type: 'boolean', description: 'Set true jika pengguna meminta semua data / penjualan keseluruhan / total penjualan toko (Opsional)' },
    },
  }
};

// Tool to search user/member info by Name or Email (without ID)
export const getUserInfoDecl = {
  name: 'get_user_info',
  description: 'Mencari informasi staf atau anggota toko berdasarkan NAMA atau EMAIL (bukan ID).',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Nama atau alamat email dari staf/pengguna toko yang dicari' }
    },
    required: ['query']
  }
};

import { requireOrganization, requireAIPermission } from "../auth-guard";

export async function getAnalytics(metric: string, period: string) {
  const store = await requireOrganization();
  await requireAIPermission('manage_transactions', store?.slug);
  // Stub analytics data; replace with real analytics backend.
  return { metric, period, value: 0 };
}

export const getAnalyticsDecl = {
  name: 'get_analytics',
  description: 'Retrieve analytics data for a specific metric and period.',
  parameters: {
    type: 'object',
    properties: {
      metric: { type: 'string', description: 'Metric name' },
      period: { type: 'string', description: "Time period, e.g., 'last_7_days'" }
    },
    required: ['metric', 'period']
  }
};

// Tool declaration to get Products
export const getProductsDecl = {
  name: 'get_products',
  description: 'Mengambil seluruh daftar produk toko, stok, harga, dan kategori produk. Memerlukan izin manage_products.',
  parameters: { type: 'object', properties: {} },
};

// Tool declaration to get Staff/Members
export const getStaffDecl = {
  name: 'get_staff',
  description: 'Mengambil daftar seluruh staf / anggota toko beserta peran (role) mereka. Memerlukan izin manage_staff.',
  parameters: { type: 'object', properties: {} },
};

// Tool declaration to get Transactions
export const getTransactionsDecl = {
  name: 'get_transactions',
  description: 'Mengambil daftar transaksi terbaru toko, kategori transaksi, dan total harga. Memerlukan izin manage_transactions.',
  parameters: { type: 'object', properties: {} },
};

// Tool declaration to get Payment Methods
export const getPaymentMethodsDecl = {
  name: 'get_payment_methods',
  description: 'Mengambil daftar metode pembayaran yang didukung toko. Memerlukan izin manage_transaction_method.',
  parameters: { type: 'object', properties: {} },
};

// Export OpenRouter / OpenAI compatible tools array
export const openRouterTools = [
  { type: 'function', function: getSalesReport },
  { type: 'function', function: getUserInfoDecl },
  { type: 'function', function: getAnalyticsDecl },
  { type: 'function', function: getProductsDecl },
  { type: 'function', function: getStaffDecl },
  { type: 'function', function: getTransactionsDecl },
  { type: 'function', function: getPaymentMethodsDecl },
];



