'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addTransactionDashboard } from './actions';
import { TransactionType } from '@/generated/prisma/client';
import { AlertTriangle, TrendingUp, Calendar, CreditCard, ArrowUpRight, ArrowDownLeft, Receipt } from 'lucide-react';

interface UserDashboardProps {
  activeCompany: any
  initialTransactions: any[]
  categories: any[]
  paymentMethods: any[]
  products: any[]
  totalIncome: number
  totalExpense: number
  balance: number
  belumMencatatHari: number
}

export default function Dashboard({
  activeCompany,
  initialTransactions,
  categories,
  paymentMethods,
  products,
  belumMencatatHari
}: UserDashboardProps) {
  const router = useRouter();

  // State untuk filter waktu & modal
  const [timeframe, setTimeframe] = useState<'all' | 'today' | 'week'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formType, setFormType] = useState<TransactionType>('INCOME');
  const [formPrice, setFormPrice] = useState('');
  const [formDetail, setFormDetail] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('');

  // Fungsi untuk membuka dan menutup modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form
    setFormType('INCOME');
    setFormPrice('');
    setFormDetail('');
    setFormCategory('');
    setFormPaymentMethod('');
  };

  // Dinamis kalkulasi stats berdasarkan timeframe
  const getFilteredStats = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Awal minggu ini (Minggu)
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    const startOfWeek = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()).getTime();

    const filtered = initialTransactions.filter(t => {
      const txTime = new Date(t.createdAt).getTime();
      if (timeframe === 'today') return txTime >= startOfToday;
      if (timeframe === 'week') return txTime >= startOfWeek;
      return true;
    });

    const income = filtered
      .filter(t => t.transactionType === 'INCOME')
      .reduce((sum, t) => sum + t.totalPrice, 0);

    const expense = filtered
      .filter(t => t.transactionType === 'EXPENSE')
      .reduce((sum, t) => sum + t.totalPrice, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  };

  const { income, expense, balance } = getFilteredStats();

  // Ambil produk stok menipis (stok <= 5)
  const lowStockProducts = products.filter(p => p.stock <= 5);

  // Ambil produk paling laris (berdasarkan transaksi Kasir)
  const getBestSellingProducts = () => {
    const salesMap: Record<string, { name: string; quantity: number; price: number }> = {};
    const cashierTransactions = initialTransactions.filter(t => t.transactionCategory === 'Kasir');

    for (const t of cashierTransactions) {
      try {
        const items = JSON.parse(t.detail);
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item && item.name && item.amount) {
              if (!salesMap[item.name]) {
                salesMap[item.name] = { name: item.name, quantity: 0, price: item.price };
              }
              salesMap[item.name].quantity += Number(item.amount);
            }
          }
        }
      } catch (e) {
        // Abaikan error parse
      }
    }

    return Object.values(salesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  };

  const bestSelling = getBestSellingProducts();

  // 5 Transaksi terakhir
  const recentTransactions = initialTransactions.slice(0, 5);

  // Fungsi saat form disubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formPrice || Number(formPrice) <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }
    if (!formDetail.trim()) {
      toast.error("Keterangan harus diisi");
      return;
    }
    if (!formCategory) {
      toast.error("Kategori harus dipilih");
      return;
    }
    if (!formPaymentMethod) {
      toast.error("Metode pembayaran harus dipilih");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addTransactionDashboard({
        totalPrice: Number(formPrice),
        detail: formDetail,
        transactionType: formType,
        paymentMethod: formPaymentMethod,
        transactionCategory: formCategory,
      });

      if (result.success) {
        toast.success("Transaksi berhasil disimpan!");
        handleCloseModal();
        router.refresh();
      } else {
        toast.error(result.message || "Gagal menyimpan transaksi.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredCategories = categories.filter(c => c.type === formType);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto relative">
      
      {/* Header & Aksi */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Keuangan</h1>
          <p className="text-sm text-slate-500">{activeCompany?.name || 'Perusahaan Saat Ini'}</p>
        </div>

        {/* Filter Waktu & Tombol Aksi */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button 
              onClick={() => setTimeframe('all')} 
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 hover:scale-[1.02] cursor-pointer ${timeframe === 'all' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setTimeframe('today')} 
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 hover:scale-[1.02] cursor-pointer ${timeframe === 'today' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Hari Ini
            </button>
            <button 
              onClick={() => setTimeframe('week')} 
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 hover:scale-[1.02] cursor-pointer ${timeframe === 'week' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Minggu Ini
            </button>
          </div>

          <button 
            onClick={handleOpenModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            + Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Reminder Alert */}
      {belumMencatatHari >= 2 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-xl shadow-xs flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-sm">Pengingat Transaksi</p>
            <p className="text-xs text-amber-700">Kamu belum mencatat transaksi selama <span className="font-semibold">{belumMencatatHari}</span> hari. Yuk, catat transaksi barumu sekarang!</p>
          </div>
        </div>
      )}

      {/* --- Bagian Card Ringkasan --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Sisa Saldo */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
          <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Sisa Saldo</h3>
          <p className={`text-2xl font-extrabold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatRupiah(balance)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium capitalize">Periode: {timeframe === 'all' ? 'semua waktu' : timeframe === 'today' ? 'hari ini' : 'minggu ini'}</span>
        </div>

        {/* Card Uang Masuk */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
          <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Total Uang Masuk</h3>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatRupiah(income)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium capitalize">Periode: {timeframe === 'all' ? 'semua waktu' : timeframe === 'today' ? 'hari ini' : 'minggu ini'}</span>
        </div>

        {/* Card Uang Keluar */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
          <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Total Uang Keluar</h3>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {formatRupiah(expense)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium capitalize">Periode: {timeframe === 'all' ? 'semua waktu' : timeframe === 'today' ? 'hari ini' : 'minggu ini'}</span>
        </div>
      </div>

      {/* --- Bagian Insight Praktis --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stok Menipis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              <span>Stok Menipis (≤ 5)</span>
            </h2>
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{lowStockProducts.length} Produk</span>
          </div>

          <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex justify-between py-2 text-sm">
                  <span className="text-slate-700 font-medium">{p.name}</span>
                  <span className="font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg text-xs">{p.stock} Tersisa</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">Semua produk memiliki stok yang cukup.</p>
            )}
          </div>
        </div>

        {/* Produk Paling Laris */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={18} />
              <span>Produk Paling Laris</span>
            </h2>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Top 3</span>
          </div>

          <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
            {bestSelling.length > 0 ? (
              bestSelling.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold w-4">#{idx + 1}</span>
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs">{item.quantity} Terjual</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">Belum ada data penjualan dari kasir.</p>
            )}
          </div>
        </div>
      </div>

      {/* --- Transaksi Terakhir --- */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="text-blue-500" size={18} />
          <span>Transaksi Terakhir</span>
        </h2>

        <div className="overflow-x-auto">
          {recentTransactions.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">Keterangan & Tanggal</th>
                  <th scope="col" className="px-4 py-3">Kategori</th>
                  <th scope="col" className="px-4 py-3">Pembayaran</th>
                  <th scope="col" className="px-4 py-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((item) => {
                  const isIncome = item.transactionType === 'INCOME';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg border ${isIncome ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-800 text-xs">{item.detail || 'Tanpa Keterangan'}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10} />{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {item.transactionCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CreditCard size={12} className="text-slate-400" />
                          {item.paymentMethod}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-xs">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-800'}>
                          {isIncome ? '+' : '-'} {formatRupiah(item.totalPrice)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-6">Belum ada transaksi yang tercatat.</p>
          )}
        </div>
      </div>

      {/* --- KODE POP-UP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Tambah Transaksi Baru</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Pilihan Jenis Transaksi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                <select 
                  value={formType}
                  onChange={(e) => {
                    setFormType(e.target.value as TransactionType);
                    setFormCategory(''); // Reset selected category when type changes
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="INCOME">Uang Masuk (Pemasukan)</option>
                  <option value="EXPENSE">Uang Keluar (Pengeluaran)</option>
                </select>
              </div>

              {/* Input Nominal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="Contoh: 150000" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  min="1"
                />
              </div>

              {/* Input Keterangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <input 
                  type="text" 
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="Contoh: Beli kuota internet" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Pilihan Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))
                  ) : (
                    <option disabled>Tidak ada kategori untuk tipe ini</option>
                  )}
                </select>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                <select
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Pilih Metode Pembayaran</option>
                  {paymentMethods.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Tombol Aksi (Batal & Simpan) */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 hover:scale-[1.02] active:scale-95 transition-all duration-200 rounded-lg font-medium cursor-pointer"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 rounded-lg font-medium cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}