'use client'

import { useState, useEffect, useRef } from 'react'
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
import { addCategory, deleteCategory, addTransaction, deleteTransaction, getReceiptSignedUrl, getTransactions } from './actions'
import Dropdown from '@/components/Dropdown'
import DeleteCard from '@/components/deleteCard'
import Loading from '@/components/loading'
import { Transaction, TransactionCategory, PaymentMethod } from '@/generated/prisma/client'


type PaymentMethodItem = Omit<PaymentMethod, 'createdAt' | 'updatedAt' | 'organizationId'>

type TransactionItem = Omit<Transaction, 'createdAt' | 'updatedAt' | 'organizationId'> & {
  createdAt?: Date;
  updatedAt?: Date;
  organizationId?: string;
};

type TransactionCategoryItem = Omit<TransactionCategory, 'createdAt' | 'updatedAt' | 'organizationId'>

interface ManualTransactionProps {
  totalCount: number
  organizationName?: string
  user: any
  initialTransactionCategories: TransactionCategory[]
  paymentMethods: PaymentMethodItem[]
}

export default function ManualTransaction({
  totalCount: initialTotalCount,
  user,
  initialTransactionCategories,
  paymentMethods
}: ManualTransactionProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [page, setPage] = useState(1)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery])

  const prevFiltersRef = useRef({ typeFilter, categoryFilter, debouncedSearchQuery })
  const isResettingPageRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    const fetchFilteredTransactions = async () => {
      const prev = prevFiltersRef.current
      const filtersChanged = (
        prev.typeFilter !== typeFilter ||
        prev.categoryFilter !== categoryFilter ||
        prev.debouncedSearchQuery !== debouncedSearchQuery
      )

      if (filtersChanged) {
        prevFiltersRef.current = { typeFilter, categoryFilter, debouncedSearchQuery }
        if (page !== 1) {
          isResettingPageRef.current = true
          setPage(1)
          return
        }
      }

      if (isResettingPageRef.current) {
        isResettingPageRef.current = false
      }

      setIsLoadingTransactions(true)
      const type = typeFilter === 'ALL' ? undefined : (typeFilter as 'INCOME' | 'EXPENSE')
      const search = debouncedSearchQuery.trim() || undefined

      try {
        const result = await getTransactions({
          page,
          pageSize: 5,
          type,
          search
        })

        if (isMounted && result.success && result.data) {
          let data = result.data
          if (categoryFilter !== 'ALL') {
            data = data.filter(item => item.transactionCategory === categoryFilter)
          }
          setTransactions(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (isMounted) {
          setIsLoadingTransactions(false)
        }
      }
    }

    fetchFilteredTransactions()

    return () => {
      isMounted = false
    }
  }, [page, debouncedSearchQuery, typeFilter, categoryFilter])

  useEffect(() => {
    setTotalCount(initialTotalCount)
  }, [initialTotalCount])

  const [categoryToDelete, setCategoryToDelete] = useState<TransactionCategoryItem>({id: '', name: '', type: 'INCOME'})
  
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionItem | null>(null)
  const [deleteTransactionModal, setDeleteTransactionModal] = useState(false)
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false)
  
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false)

  const handleViewReceipt = async (filePath: string) => {
    setSelectedReceipt(filePath)
    setIsLoadingReceipt(true)
    setReceiptUrl(null)
    try {
      const result = await getReceiptSignedUrl(filePath)
      if (result.success && result.url) {
        setReceiptUrl(result.url)
      } else {
        toast.error(result.message || 'Gagal memuat struk')
        setSelectedReceipt(null)
      }
    } catch {
      toast.error('Gagal memuat struk')
      setSelectedReceipt(null)
    } finally {
      setIsLoadingReceipt(false)
    }
  }
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)

  const [categories, setCategories] = useState<TransactionCategory[]>(initialTransactionCategories)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  const [isLoadingAddCategory, setIsLoadingAddCategory] = useState(false)

  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [formDetail, setFormDetail] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formPaymentMethod, setFormPaymentMethod] = useState('')
  const [formReceipt, setFormReceipt] = useState<File | null>(null)
  const [newCategory, setNewCategory] = useState<{ name: string, type: 'INCOME' | 'EXPENSE' }>({ name: '', type: 'INCOME' })

  const [deleteModal, setDeleteModal] = useState(false)

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

  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const handleSubmitTransaction = async (e: React.SubmitEvent) => {
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
    if (formReceipt && formReceipt.size > 5 * 1024 * 1024) { // 5 MB
      toast.error('Ukuran file struk maksimal 5 MB!')
      return
    }

    setIsAddingTransaction(true)

    const formData = new FormData()

    const newTransaction = {
      totalPrice: formPrice,
      detail: formDetail,
      receipt: formReceipt,
      paymentMethod: formPaymentMethod,
      transactionCategory: formCategory,
      transactionType: formType,
    }

    Object.entries(newTransaction).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })

    const result = await addTransaction(formData)

    if (result.success && result.data) {
      toast.success('Berhasil membuat transaksi.')
      setTransactions([result.data, ...transactions])
      setTotalCount(prev => prev + 1)
    } else {
      toast.error(result.message)
    }

    setIsAddingTransaction(false)
    setIsAddModalOpen(false)
    setFormDetail('')
    setFormPrice('')
    setFormCategory('')
    setFormPaymentMethod('')
    setFormReceipt(null)
    setFormType('INCOME')
  }

  // Transaksi yang ditampilkan langsung menggunakan data terupdate dari state transactions
  const filteredTransactions = transactions
  const totalPages = Math.max(1, Math.ceil(totalCount / 5))

  const filteredCategories = categories.filter((item, index, self) => {
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter
    const isFirst = self.findIndex(c => c.name === item.name) === index

    return matchesType && isFirst
  })

  const filteredAddCategories = categories.filter(item => {
    const matchesType = item.type === newCategory.type

    return matchesType
  })

  const filteredAddTransactionCategories = categories.filter(item => {
    const matchesType = item.type === formType

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
  const showDeleteCategoryModal = (category: TransactionCategoryItem) => {
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

  const showDeleteTransactionModal = (transaction: TransactionItem) => {
    setTransactionToDelete(transaction)
    setDeleteTransactionModal(true)
  }

  const handleTransactionDelete = async () => {
    if (!transactionToDelete) return
    setIsDeletingTransaction(true)
    try {
      const result = await deleteTransaction(transactionToDelete as any)
      if (result.success) {
        toast.success("Berhasil membatalkan transaksi.")
        setTransactions(prev => prev.filter(item => item.id !== transactionToDelete.id))
        setTotalCount(prev => prev - 1)
      } else {
        toast.error(result.message || 'Gagal membatalkan transaksi.')
      }
    } catch {
      toast.error('Gagal membatalkan transaksi.')
    } finally {
      setIsDeletingTransaction(false)
      setDeleteTransactionModal(false)
      setTransactionToDelete(null)
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
          <div className={`relative min-w-35`}>
            <Dropdown
              options={[
                { value: 'ALL', label: 'Semua Kategori' },
                ...filteredCategories.map((cat) => ({ value: cat.name, key: cat.id, label: cat.name }))
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
        {isLoadingTransactions ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loading size={24} />
            <span className="text-sm text-slate-500">Memuat data transaksi...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
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
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Aksi
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
                              <span>{formatDate(item.createdAt as Date)}</span>
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
                          <button
                            type="button"
                            onClick={() => handleViewReceipt(item.receipt!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText size={13} />
                            <span>Lihat</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            -
                          </span>
                        )}
                      </td>

                      {/* Aksi (Delete) */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => showDeleteTransactionModal(item)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer animate-none"
                          title="Batalkan Transaksi"
                        >
                          <Trash2 size={16} />
                        </button>
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
      <div className="text-xs text-slate-500 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span>
          Menampilkan <span className="font-semibold text-slate-700">{filteredTransactions.length}</span> dari <span className="font-semibold text-slate-700">{totalCount}</span> transaksi
        </span>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            disabled={page === 1 || isLoadingTransactions}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-slate-600 font-medium px-1">
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || isLoadingTransactions}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
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
                    options={filteredAddTransactionCategories.map((cat) => ({ value: cat.name, label: cat.name, key: cat.id }))}
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
                    options={paymentMethods.map(item => ({
                      value: item.name,
                      label: item.name,
                      key: item.id
                    }))}
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
                  type="file"
                  onChange={(e) => setFormReceipt(e.target.files?.[0] || null)}
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
                  disabled={isAddingTransaction}
                  type="submit"
                  className="disabled:bg-blue-200 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {
                    isAddingTransaction
                    ? <div className='flex items-center gap-2'>
                      <Loading size={16} />
                      Menyimpan...
                    </div>
                    : 'Simpan Transaksi'
                  }
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
      <DeleteCard
        isOpen={deleteTransactionModal}
        isLoading={isDeletingTransaction}
        onClose={() => setDeleteTransactionModal(false)}
        onConfirm={handleTransactionDelete}
        title="Batalkan Transaksi"
        description="Apakah Anda yakin ingin membatalkan transaksi ini? Tindakan ini akan menghapus data transaksi secara permanen."
        itemName={transactionToDelete ? `${transactionToDelete.detail} (${formatRupiah(transactionToDelete.totalPrice)})` : undefined}
      />

      {/* Modal View Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Gambar Struk</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedReceipt(null)
                  setReceiptUrl(null)
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col items-center justify-center min-h-64 max-h-[70vh] overflow-y-auto bg-slate-50">
              {isLoadingReceipt ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loading size={24} />
                  <span className="text-sm text-slate-500">Memuat gambar struk...</span>
                </div>
              ) : receiptUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={receiptUrl}
                  alt="Struk Transaksi"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-200 shadow-sm"
                />
              ) : (
                <span className="text-sm text-slate-500">Gagal memuat gambar struk</span>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => {
                  setSelectedReceipt(null)
                  setReceiptUrl(null)
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}