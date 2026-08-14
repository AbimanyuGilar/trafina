'use client'

import { useState } from 'react'
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Download,
  Filter,
  Plus,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react'

// Representasi tipe data sesuai Prisma Model Transaction

export interface TransactionItem {
  id: string
  paymentMethodId: string
  totalPrice: bigint | number
  detail: string
  receipt: string
  paymentMethod: string
  transactionCategory: string
  transactionType: string
  organizationId: string
  createdAt: Date | string
  updatedAt?: Date | string
}

interface ManualTransactionProps {
  initialTransactions: TransactionItem[]
  organizationName?: string
}

export default function ManualTransaction({
  initialTransactions,
  organizationName = 'Organisasi',
}: ManualTransactionProps) {
  const [transactions] = useState<TransactionItem[]>(initialTransactions)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // List kategori unik untuk dropdown filter
  const categories = Array.from(
    new Set(transactions.map((t) => t.transactionCategory))
  )

  // Filter transaksi berdasarkan pencarian, tipe, dan kategori
  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch =
      item.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === 'ALL' || item.transactionType === typeFilter
    const matchesCategory =
      categoryFilter === 'ALL' || item.transactionCategory === categoryFilter

    return matchesSearch && matchesType && matchesCategory
  })

  // Kalkulasi Total Pemasukan & Pengeluaran
  const totalIncome = filteredTransactions
    .filter((t) => t.transactionType === 'INCOME')
    .reduce((acc, curr) => acc + Number(curr.totalPrice), 0)

  const totalExpense = filteredTransactions
    .filter((t) => t.transactionType === 'EXPENSE')
    .reduce((acc, curr) => acc + Number(curr.totalPrice), 0)

  // Helper Format Rupiah
  const formatRupiah = (amount: number | bigint) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(amount))
  }

  // Helper Format Tanggal
  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Manajemen Transaksi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola dan pantau seluruh arus kas transaksi di {organizationName}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download size={16} strokeWidth={2} />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2} />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Pemasukan */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Pemasukan
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpRight size={18} strokeWidth={2} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatRupiah(totalIncome)}
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Pengeluaran
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <ArrowDownLeft size={18} strokeWidth={2} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatRupiah(totalExpense)}
          </p>
        </div>

        {/* Net Balance / Selisih */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Selisih Kas (Net)
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Receipt size={18} strokeWidth={2} />
            </div>
          </div>
          <p
            className={`text-2xl font-bold tracking-tight ${
              totalIncome - totalExpense >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatRupiah(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari detail, metode bayar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Filter Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Type */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('INCOME')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'INCOME'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('EXPENSE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'EXPENSE'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
          </div>

          {/* Filter Category Dropdown */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl shadow-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 4. Table Transaction List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Receipt size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Tidak ada data transaksi
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada transaksi recorded atau pencarian Anda tidak mencocokkan kriteria apa pun.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wide font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Detail & Tanggal
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Pembayaran
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Jumlah (Rp)
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Struk
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((item) => {
                  const isIncome = item.transactionType === 'INCOME'

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Detail & Tanggal */}
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight size={16} strokeWidth={2.25} />
                            ) : (
                              <ArrowDownLeft size={16} strokeWidth={2.25} />
                            )}
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-900">
                              {item.detail || 'Tanpa Keterangan'}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                              <Calendar size={13} />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                          {item.transactionCategory}
                        </span>
                      </td>

                      {/* Metode Pembayaran */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700 font-medium text-xs">
                          <CreditCard size={15} className="text-slate-400 shrink-0" />
                          <span>{item.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Jumlah (TotalPrice) */}
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-bold tracking-tight ${
                            isIncome ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatRupiah(item.totalPrice)}
                        </span>
                      </td>

                      {/* Link Struk (Receipt) */}
                      <td className="px-6 py-4 text-center">
                        {item.receipt ? (
                          <a
                            href={item.receipt}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors"
                          >
                            <FileText size={13} />
                            <span>Lihat</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Count Footnote */}
      <div className="text-xs text-slate-500 px-1 flex items-center justify-between">
        <span>
          Menampilkan <span className="font-semibold text-slate-700">{filteredTransactions.length}</span> dari <span className="font-semibold text-slate-700">{transactions.length}</span> transaksi
        </span>
      </div>
    </div>
  )
}