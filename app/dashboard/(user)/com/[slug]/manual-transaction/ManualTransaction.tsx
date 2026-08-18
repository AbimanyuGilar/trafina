'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Download,
  Trash2,
  Plus,
  Calendar,
  CreditCard,
  FileText,
  X,
  Edit,
} from 'lucide-react'
import { toast } from 'sonner'
import { getCategories, addCategory, deleteCategory } from './actions'
import Dropdown from '@/components/Dropdown'
import DeleteCard from '@/components/deleteCard'
import Loading from '@/components/loading'

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

export interface TransactionCategory {
  id: string
  name: string
  type?: 'INCOME' | 'EXPENSE' | string
  organizationId?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface ManualTransactionProps {
  initialTransactions: TransactionItem[]
  organizationName?: string
  user: any
  initialTransactionCategories: TransactionCategory[]
}

export default function ManualTransaction({
  initialTransactions,
  user,
  initialTransactionCategories
}: ManualTransactionProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const [categoryToDelete, setCategoryToDelete] = useState<TransactionCategory>({id: '', name: ''})
  
  // Add Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Add Category Modal State
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)

  const [categories, setCategories] = useState<TransactionCategory[]>(initialTransactionCategories)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [isLoadingAddCategory, setIsLoadingAddCategory] = useState(false)

  // Form State
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [formDetail, setFormDetail] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formPaymentMethod, setFormPaymentMethod] = useState('')
  const [formReceipt, setFormReceipt] = useState('')
  const [newCategory, setNewCategory] = useState<{ name: string, type: 'INCOME' | 'EXPENSE' }>({ name: '', type: 'INCOME' })

  const [deleteModal, setDeleteModal] = useState(false)

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    setCategoriesError(null)
    try {
      const data = await getCategories()
      setCategories(data || [])
      console.log(data)
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setCategoriesError(err.message || 'Gagal memuat kategori')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleSubmitCategory = async (e: React.SubmitEvent) => {
    setIsLoadingAddCategory(true)
    e.preventDefault()

    if (!newCategory.name.trim()) {
      toast.error('Nama kategori harus diisi')
      return
    }
    
    const result = await addCategory(newCategory)

    setCategories(prev => [
      result as TransactionCategory,
      ...prev
    ])

    setNewCategory(prev => ({
      ...prev,
      name: ''
    }))

    toast.success('Kategori berhasil ditambahkan!')

    setIsLoadingAddCategory(false)
  }

  const handleSubmitTransaction = (e: React.SubmitEvent) => {
    e.preventDefault()

    if (!formDetail.trim()) {
      toast.error('Detail transaksi harus diisi')
      return
    }
    if (!formPrice || Number(formPrice) <= 0) {
      toast.error('Jumlah transaksi harus lebih dari 0')
      return
    }
    if (!formCategory) {
      toast.error('Kategori harus dipilih')
      return
    }
    if (!formPaymentMethod) {
      toast.error('Metode pembayaran harus dipilih')
      return
    }

    const paymentMethodIds: Record<string, string> = {
      'QRIS': 'pm_qris_local',
      'Transfer Bank - BCA': 'pm_bank_transfer_local',
      'Tunai': 'pm_cash_local',
      'Kartu Kredit': 'pm_credit_card_local'
    }

    const newTransaction: TransactionItem = {
      id: `tx_local_${Date.now()}`,
      paymentMethodId: paymentMethodIds[formPaymentMethod] || 'pm_custom_local',
      totalPrice: Number(formPrice),
      detail: formDetail,
      receipt: formReceipt,
      paymentMethod: formPaymentMethod,
      transactionCategory: formCategory,
      transactionType: formType,
      organizationId: 'local_org',
      createdAt: new Date(),
    }

    setTransactions([newTransaction, ...transactions])
    toast.success('Transaksi berhasil ditambahkan!')
    setIsAddModalOpen(false)

    // Reset Form
    setFormDetail('')
    setFormPrice('')
    setFormCategory('')
    setFormPaymentMethod('')
    setFormReceipt('')
    setFormType('INCOME')
  }

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

  const filteredCategories = categories.filter(item => {
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter

    return matchesType
  })

  const filteredAddCategories = categories.filter(item => {
    const matchesType = item.type === newCategory.type

    return matchesType
  })

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

  const [isDeleting, setIsDeleting] = useState(false)
  const showDeleteCategoryModal = (category: any) => {
    setCategoryToDelete(category)
    setDeleteModal(true)
  }

  const handleCategoryDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCategory(categoryToDelete)
      toast.success("Berhasil menghapus kategori.")
      const updatedCategories = categories.filter(item => (
        item.id !== categoryToDelete.id
      ))
      setCategories(updatedCategories)
    } catch {
      toast.error('Gagal menghapus kategori.')
    } finally {
      setIsDeleting(false)
      setDeleteModal(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Transaksi Manual
          </h1>
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
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2} />
            <span>Tambah Transaksi</span>
          </button>
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
          <div className={`relative min-w-[140px]`}>
            <Dropdown
              options={[
                { value: 'ALL', label: 'Semua Kategori' },
                ...filteredCategories.map((cat) => ({ value: cat.id, label: cat.name }))
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Semua Kategori"
              className="px-3 py-1.5 text-xs font-semibold h-9"
            />
          </div>
          
          <button
          type="button"
            disabled={isLoadingAddCategory}
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white active:bg-blue-800 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <Edit size={16} strokeWidth={2} />
            <span>Atur Kategori</span>
          </button>
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

      {/* Modal Tambah Transaksi */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Tambah Transaksi Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4">
              {/* Transaction Type Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFormType('INCOME')}
                    className={`py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      formType === 'INCOME'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('EXPENSE')}
                    className={`py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      formType === 'EXPENSE'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              {/* Detail/Keterangan */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Detail / Keterangan
                </label>
                <input
                  type="text"
                  required
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="Contoh: Pembelian Alat Tulis Kantor"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Total Price / Jumlah */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Jumlah (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Category & Payment Method in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Kategori
                  </label>
                  
                  <Dropdown
                    options={categories.map((cat) => ({ value: cat.name, label: cat.name }))}
                    value={formCategory}
                    onChange={setFormCategory}
                    placeholder="Pilih Kategori"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Metode Pembayaran
                  </label>
                  <Dropdown
                    options={[
                      { value: 'QRIS', label: 'QRIS' },
                      { value: 'Transfer Bank - BCA', label: 'Transfer Bank - BCA' },
                      { value: 'Tunai', label: 'Tunai' },
                      { value: 'Kartu Kredit', label: 'Kartu Kredit' }
                    ]}
                    value={formPaymentMethod}
                    onChange={setFormPaymentMethod}
                    placeholder="Pilih Metode"
                  />
                </div>
              </div>

              {/* Link Struk (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Link Struk / Lampiran (Opsional)
                </label>
                <input
                  type="url"
                  value={formReceipt}
                  onChange={(e) => setFormReceipt(e.target.value)}
                  placeholder="https://example.com/receipt.jpg"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Atur Kategori Transaksi</h3>
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitCategory} className="p-6 space-y-4">
              {/* Transaction Type Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNewCategory(prev => ({
                      ...prev,
                      type: 'INCOME'
                    }))}
                    className={`py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      newCategory.type === 'INCOME'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory(prev => ({
                      ...prev,
                      type: 'EXPENSE'
                    }))}
                    className={`py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      newCategory.type === 'EXPENSE'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              {/* Detail/Keterangan */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Contoh: Re-stock barang"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  disabled={isLoadingAddCategory}
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {
                  isLoadingAddCategory 
                  ? (
                    <>
                      <Loading />
                      Memuat...
                    </>
                  )
                  :'Tambah Kategori' }
                </button>
              </div>
            </form>

            {/* List Kategori */}
            <div className="border-t border-slate-100 p-6 bg-slate-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Daftar Kategori ({filteredAddCategories.length})
              </h4>
              {filteredAddCategories.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada kategori yang terdaftar.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {
                    isLoadingCategories
                    ? <p className="text-xs text-slate-400 italic">Memuat...</p>
                    : filteredAddCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs"
                      >
                        <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                        {
                          (cat.name !== 'Kasir') && (
                            <button onClick={() => showDeleteCategoryModal(cat)} className='text-red-500 hover:bg-red-200 cursor-pointer rounded-sm text-xs'>
                              <Trash2 className='p-1'/>
                            </button>
                          )
                        }
                        
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DeleteCard isOpen={deleteModal} isLoading={isDeleting} onClose={() => setDeleteModal(false)} onConfirm={handleCategoryDelete} />
    </div>
  )
}