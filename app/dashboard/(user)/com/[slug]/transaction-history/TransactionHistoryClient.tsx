"use client"

import React, { useState } from "react"
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  CreditCard,
  Filter,
  Search,
  X,
  Eye,
  Trash2,
  ChevronDown,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  ReceiptText,
  ShoppingCart,
  Package,
} from "lucide-react"

type Transaction = {
  id: string
  type: string
  category: string
  total: number
  paymentMethod: string
  detail: string
  date: string
}

type TransactionHistoryClientProps = {
  transactions: Transaction[]
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const formatDateFull = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

// ── Kasir receipt component ──────────────────────────────────────────────────

type KasirProduct = {
  id: string
  name: string
  price: number
  amount: number
}

const KasirDetail = ({ detail }: { detail: string }) => {
  let products: KasirProduct[] = []
  try {
    products = JSON.parse(detail)
  } catch {
    return (
      <p className="text-sm" style={{ color: "#334155" }}>
        {detail}
      </p>
    )
  }

  const grandTotal = products.reduce((sum, p) => sum + p.price * p.amount, 0)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #E2E8F0" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}
      >
        <ShoppingCart size={13} strokeWidth={2} style={{ color: "#2563EB" }} />
        <span
          className="text-xs font-semibold uppercase"
          style={{ color: "#2563EB", letterSpacing: "0.05em" }}
        >
          {products.length} item
        </span>
      </div>

      {/* Product rows */}
      <div className="divide-y" style={{ borderColor: "#F1F5F9" }}>
        {products.map((p, i) => (
          <div key={p.id ?? i} className="flex items-start gap-2 px-3 py-2.5">
            <div
              className="mt-0.5 w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <Package size={11} strokeWidth={2} style={{ color: "#2563EB" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold leading-tight truncate"
                style={{ color: "#0F172A" }}
              >
                {p.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                {p.amount} × {formatCurrency(p.price)}
              </p>
            </div>
            <p
              className="text-xs font-semibold flex-shrink-0"
              style={{ color: "#334155" }}
            >
              {formatCurrency(p.price * p.amount)}
            </p>
          </div>
        ))}
      </div>

      {/* Grand total */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ backgroundColor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}
      >
        <span className="text-xs font-semibold" style={{ color: "#64748B" }}>
          Total
        </span>
        <span className="text-sm font-bold" style={{ color: "#16A34A" }}>
          {formatCurrency(grandTotal)}
        </span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const TransactionHistoryClient = ({
  transactions,
}: TransactionHistoryClientProps) => {
  const [transactionList, setTransactionList] =
    useState<Transaction[]>(transactions)
  const [filterType, setFilterType] = useState("ALL")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    ...new Set(
      transactionList
        .map((tx) => tx.category)
        .filter((c) => c && c.trim() !== "")
    ),
  ]

  const filteredTransactions = transactionList.filter((tx) => {
    const txDate = new Date(tx.date)
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null
    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null
    const query = searchQuery.toLowerCase()

    return (
      (filterType === "ALL" || tx.type === filterType) &&
      (filterCategory === "ALL" || tx.category === filterCategory) &&
      (!start || txDate >= start) &&
      (!end || txDate <= end) &&
      (!query ||
        tx.category.toLowerCase().includes(query) ||
        tx.paymentMethod.toLowerCase().includes(query) ||
        tx.detail.toLowerCase().includes(query))
    )
  })

  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === "INCOME")
    .reduce((sum, tx) => sum + tx.total, 0)

  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + tx.total, 0)

  const hasActiveFilters =
    filterType !== "ALL" ||
    filterCategory !== "ALL" ||
    startDate !== "" ||
    endDate !== "" ||
    searchQuery !== ""

  const clearFilters = () => {
    setFilterType("ALL")
    setFilterCategory("ALL")
    setStartDate("")
    setEndDate("")
    setSearchQuery("")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .txh-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .txh-select { appearance: none; -webkit-appearance: none; }
        .txh-modal-overlay { animation: txhFadeIn 0.2s ease; }
        .txh-modal-panel { animation: txhSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes txhFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes txhSlideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .txh-row-hover:hover { background-color: #F8FAFC; transition: background-color 0.15s ease; }
        .txh-btn-icon { transition: transform 0.15s ease; }
        .txh-btn-icon:hover { transform: scale(1.08); }
      `}</style>

      <div className="txh-root min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">

          {/* ── Header ── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <ReceiptText size={22} strokeWidth={1.75} style={{ color: "#2563EB" }} />
              <h1
                className="text-2xl font-bold"
                style={{ color: "#0F172A", letterSpacing: "-0.025em" }}
              >
                Riwayat Transaksi
              </h1>
            </div>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {filteredTransactions.length} transaksi ditemukan
              {hasActiveFilters && " · Filter aktif"}
            </p>
          </div>

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} strokeWidth={2} color="#16A34A" />
                <span
                  className="text-xs font-semibold uppercase"
                  style={{ color: "#64748B", letterSpacing: "0.05em" }}
                >
                  Pemasukan
                </span>
              </div>
              <p className="text-lg font-bold" style={{ color: "#16A34A" }}>
                {formatCurrency(totalIncome)}
              </p>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={15} strokeWidth={2} color="#DC2626" />
                <span
                  className="text-xs font-semibold uppercase"
                  style={{ color: "#64748B", letterSpacing: "0.05em" }}
                >
                  Pengeluaran
                </span>
              </div>
              <p className="text-lg font-bold" style={{ color: "#DC2626" }}>
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>

          {/* ── Search & Filter Bar ── */}
          <div
            className="rounded-xl mb-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center gap-3 p-3 sm:p-4">
              <div className="relative flex-1">
                <Search
                  size={15}
                  strokeWidth={2}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#94A3B8" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kategori, metode, atau catatan..."
                  className="w-full text-sm pl-9 pr-3 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: "#F1F5F9", color: "#0F172A", border: "none" }}
                />
              </div>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: showFilters ? "#EFF6FF" : "#F1F5F9",
                  color: showFilters ? "#2563EB" : "#334155",
                  border: showFilters ? "1px solid #BFDBFE" : "1px solid transparent",
                }}
              >
                <Filter size={14} strokeWidth={2} />
                Filter
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#2563EB" }} />
                )}
                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  style={{
                    transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
            </div>

            {showFilters && (
              <div
                className="px-3 pb-3 sm:px-4 sm:pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
                style={{ borderTop: "1px solid #F1F5F9" }}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "#64748B" }}>
                    Jenis Transaksi
                  </label>
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="txh-select w-full text-sm pl-3 pr-8 py-2 rounded-lg outline-none cursor-pointer"
                      style={{ backgroundColor: "#F1F5F9", color: "#0F172A", border: "none" }}
                    >
                      <option value="ALL">Semua</option>
                      <option value="INCOME">Pemasukan</option>
                      <option value="EXPENSE">Pengeluaran</option>
                    </select>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "#64748B" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "#64748B" }}>
                    Kategori
                  </label>
                  <div className="relative">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="txh-select w-full text-sm pl-3 pr-8 py-2 rounded-lg outline-none cursor-pointer"
                      style={{ backgroundColor: "#F1F5F9", color: "#0F172A", border: "none" }}
                    >
                      <option value="ALL">Semua</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "#64748B" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "#64748B" }}>
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: "#F1F5F9", color: "#0F172A", border: "none" }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: "#64748B" }}>
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: "#F1F5F9", color: "#0F172A", border: "none" }}
                  />
                </div>

                {hasActiveFilters && (
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ color: "#DC2626", backgroundColor: "#FEF2F2" }}
                    >
                      <X size={12} strokeWidth={2} />
                      Hapus Semua Filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Transaction List ── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)",
            }}
          >
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <ReceiptText
                  size={40}
                  strokeWidth={1.25}
                  style={{ color: "#CBD5E1", marginBottom: "12px" }}
                />
                <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                  Tidak ada transaksi ditemukan
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-xs font-medium"
                    style={{ color: "#2563EB" }}
                  >
                    Hapus filter untuk melihat semua
                  </button>
                )}
              </div>
            ) : (
              <div>
                {filteredTransactions.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className="txh-row-hover"
                    style={{
                      borderBottom:
                        idx < filteredTransactions.length - 1
                          ? "1px solid #F1F5F9"
                          : "none",
                    }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor:
                            tx.type === "INCOME" ? "#F0FDF4" : "#FFF1F2",
                        }}
                      >
                        {tx.type === "INCOME" ? (
                          <ArrowUpCircle size={18} strokeWidth={1.75} color="#16A34A" />
                        ) : (
                          <ArrowDownCircle size={18} strokeWidth={1.75} color="#DC2626" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm font-semibold truncate"
                            style={{ color: "#0F172A" }}
                          >
                            {tx.category || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "#94A3B8" }}
                          >
                            <Calendar size={11} strokeWidth={2} />
                            {formatDate(tx.date)}
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "#94A3B8" }}
                          >
                            <CreditCard size={11} strokeWidth={2} />
                            {tx.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: tx.type === "INCOME" ? "#16A34A" : "#DC2626",
                          }}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(tx.total)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTransaction(tx)}
                            className="txh-btn-icon p-1.5 rounded-lg"
                            style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}
                            title="Lihat Detail"
                          >
                            <Eye size={13} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {filteredTransactions.length > 0 && (
            <p className="text-center text-xs mt-4" style={{ color: "#94A3B8" }}>
              Menampilkan {filteredTransactions.length} dari {transactionList.length} transaksi
            </p>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedTransaction && (
        <div
          className="txh-modal-overlay fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          style={{ backgroundColor: "rgba(15,23,42,0.35)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTransaction(null)
          }}
        >
          <div
            className="txh-modal-panel w-full sm:max-w-md flex flex-col rounded-t-2xl sm:rounded-2xl"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 20px 60px -10px rgba(0,0,0,0.15), 0 8px 24px -8px rgba(0,0,0,0.1)",
              maxHeight: "90dvh",
            }}
          >
            {/* Modal Header — fixed */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #F1F5F9" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor:
                      selectedTransaction.type === "INCOME" ? "#F0FDF4" : "#FFF1F2",
                  }}
                >
                  {selectedTransaction.type === "INCOME" ? (
                    <ArrowUpCircle size={16} strokeWidth={1.75} color="#16A34A" />
                  ) : (
                    <ArrowDownCircle size={16} strokeWidth={1.75} color="#DC2626" />
                  )}
                </div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "#0F172A", letterSpacing: "-0.01em" }}
                >
                  Detail Transaksi
                </h2>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto min-h-0">

              {/* Amount Highlight */}
              <div
                className="px-5 py-4"
                style={{ backgroundColor: "#FAFAFA", borderBottom: "1px solid #F1F5F9" }}
              >
                <p
                  className="text-xs font-semibold uppercase mb-1"
                  style={{ color: "#94A3B8", letterSpacing: "0.06em" }}
                >
                  {selectedTransaction.type === "INCOME" ? "Total Pemasukan" : "Total Pengeluaran"}
                </p>
                <p
                  className="text-2xl font-bold leading-tight"
                  style={{
                    color: selectedTransaction.type === "INCOME" ? "#16A34A" : "#DC2626",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {selectedTransaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(selectedTransaction.total)}
                </p>
                <p className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>
                  {formatDateFull(selectedTransaction.date)}
                </p>
              </div>

              {/* Info Rows */}
              <div className="px-5 pt-4 pb-2">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid #E2E8F0" }}
                >
                  {[
                    {
                      icon: <ArrowUpCircle size={13} strokeWidth={2} />,
                      label: "Jenis",
                      value:
                        selectedTransaction.type === "INCOME"
                          ? "Pemasukan"
                          : "Pengeluaran",
                      valueColor:
                        selectedTransaction.type === "INCOME" ? "#16A34A" : "#DC2626",
                    },
                    {
                      icon: <Tag size={13} strokeWidth={2} />,
                      label: "Kategori",
                      value: selectedTransaction.category,
                    },
                    {
                      icon: <CreditCard size={13} strokeWidth={2} />,
                      label: "Metode Pembayaran",
                      value: selectedTransaction.paymentMethod,
                    },
                  ].map(({ icon, label, value, valueColor }, i, arr) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none",
                      }}
                    >
                      <div className="flex items-center gap-2 flex-shrink-0" style={{ color: "#94A3B8" }}>
                        {icon}
                        <span className="text-xs font-medium" style={{ color: "#64748B" }}>
                          {label}
                        </span>
                      </div>
                      <span
                        className="text-sm font-semibold text-right ml-4"
                        style={{ color: valueColor ?? "#0F172A" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan / Items */}
              <div className="px-5 pt-3 pb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  {selectedTransaction.category === "Kasir" ? (
                    <ShoppingCart size={13} strokeWidth={2} style={{ color: "#64748B" }} />
                  ) : (
                    <FileText size={13} strokeWidth={2} style={{ color: "#64748B" }} />
                  )}
                  <span className="text-xs font-semibold" style={{ color: "#64748B" }}>
                    {selectedTransaction.category === "Kasir" ? "Item Pembelian" : "Catatan"}
                  </span>
                </div>

                {selectedTransaction.category === "Kasir" ? (
                  <KasirDetail detail={selectedTransaction.detail} />
                ) : (
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#334155", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {selectedTransaction.detail || "—"}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer — fixed */}
            <div
              className="flex-shrink-0 px-5 py-3 flex gap-2"
              style={{ borderTop: "1px solid #F1F5F9" }}
            >
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 flex items-center justify-center text-sm font-semibold py-2.5 px-4 rounded-xl"
                style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TransactionHistoryClient