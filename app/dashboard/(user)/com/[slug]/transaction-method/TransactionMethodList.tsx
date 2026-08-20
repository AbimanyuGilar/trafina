'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2
} from 'lucide-react'
import DeleteCard from '@/components/deleteCard'
import { toast } from 'sonner'
import {
  addTransactionMethod,
  deleteTransactionMethod,
  updateTransactionMethod,
  getTransactionMethods,
  getMethodsCount
} from './actions'

export interface TransactionMethodItem {
  id: string
  name: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export default function TransactionMethodList() {
  const [methods, setMethods] = useState<TransactionMethodItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedEditItem, setSelectedEditItem] = useState<TransactionMethodItem | null>(null)
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<TransactionMethodItem | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch data function
  const fetchData = useCallback(async (currentPage: number, searchVal: string) => {
    setIsLoading(true)
    try {
      const methodsRes = await getTransactionMethods({
        page: currentPage,
        pageSize: 5,
        search: searchVal ? searchVal.trim() : undefined,
      })

      if (methodsRes.success && methodsRes.data) {
        setMethods(methodsRes.data as TransactionMethodItem[])
      } else {
        toast.error(methodsRes.message || 'Gagal memuat metode transaksi')
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch initial total count on mount only
  useEffect(() => {
    const fetchInitialCount = async () => {
      try {
        const countRes = await getMethodsCount()
        if (countRes.success && countRes.data !== undefined) {
          setTotalCount(countRes.data)
        } else {
          toast.error(countRes.message || 'Gagal memuat total metode transaksi')
        }
      } catch {
        toast.error('Terjadi kesalahan saat memuat total metode transaksi')
      }
    }
    fetchInitialCount()
  }, [])

  const prevFiltersRef = useRef({ debouncedSearchQuery })
  const isResettingPageRef = useRef(false)

  useEffect(() => {
    const prev = prevFiltersRef.current
    const filtersChanged = prev.debouncedSearchQuery !== debouncedSearchQuery

    if (filtersChanged) {
      prevFiltersRef.current = { debouncedSearchQuery }
      if (page !== 1) {
        isResettingPageRef.current = true
        setPage(1)
        return
      }
    }

    if (isResettingPageRef.current) {
      isResettingPageRef.current = false
    }

    fetchData(page, debouncedSearchQuery)
  }, [page, debouncedSearchQuery, fetchData])

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setFormName('')
    setIsAddOpen(true)
  }

  // Buka Modal Edit
  const handleOpenEdit = (item: TransactionMethodItem) => {
    setSelectedEditItem(item)
    setFormName(item.name)
  }

  // Submit Tambah
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Nama metode harus diisi')
      return
    }

    setIsSubmitting(true)
    const newMethod = await addTransactionMethod(formName.trim())

    if (newMethod?.success) {
      toast.success(`Metode "${newMethod?.data?.name}" berhasil ditambahkan`)
      setTotalCount((prev) => prev + 1)
      if (page !== 1) {
        setPage(1)
      } else {
        fetchData(1, debouncedSearchQuery)
      }
    } else {
      toast.error(newMethod?.message)
    }

    setIsAddOpen(false)
    setIsSubmitting(false)
  }

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEditItem) return
    if (!formName.trim()) {
      toast.error('Nama metode harus diisi')
      return
    }

    setIsSubmitting(true)

    const updated = await updateTransactionMethod({ newName: formName.trim(), methodId: selectedEditItem.id })

    if (updated.success) {
      toast.success(`Metode berhasil diperbarui menjadi "${formName}"`)
      fetchData(page, debouncedSearchQuery)
    } else {
      toast.error(updated.message || 'Gagal memperbarui metode')
    }

    setSelectedEditItem(null)
    setIsSubmitting(false)
  }

  // Konfirmasi Hapus
  const handleDeleteConfirm = async () => {
    if (!selectedDeleteItem) return
    setIsDeleting(true)
    const deleted = await deleteTransactionMethod(selectedDeleteItem)

    if (deleted.success) {
      toast.success(`Metode "${selectedDeleteItem.name}" berhasil dihapus`)
      setTotalCount((prev) => Math.max(0, prev - 1))
      if (methods.length === 1 && page > 1) {
        setPage((prev) => prev - 1)
      } else {
        fetchData(page, debouncedSearchQuery)
      }
    } else {
      toast.error(deleted.message)
    }

    setSelectedDeleteItem(null)
    setIsDeleting(false)
  }

  const totalPages = Math.max(1, Math.ceil((totalCount - 2) / 5))

  return (
    <div className="space-y-4">
      {/* Search Bar & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari metode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Metode</span>
        </button>
      </div>

      {/* Tabel Sederhana */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            <span>Memuat data...</span>
          </div>
        ) : methods.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Metode transaksi tidak ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wide font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Nama Metode Transaksi</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {methods.map((method) => (
                  <tr key={method.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{method.name}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {
                        method.name !== 'Tunai' && method.name !== 'QRIS' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(method)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Ubah Nama"
                            >
                              <Edit className='text-blue-500' size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedDeleteItem(method)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className='text-red-500' size={15} />
                            </button>
                          </div>
                        )
                      }
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info & Pagination */}
      <div className="text-xs text-slate-500 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span>
          Menampilkan <span className="font-semibold text-slate-700">{methods.length}</span> dari{' '}
          <span className="font-semibold text-slate-700">{totalCount}</span> data
        </span>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            disabled={page === 1 || isLoading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Sebelumnya
          </button>
          {debouncedSearchQuery ? (
            <span className="text-xs text-slate-600 font-medium px-1">
              Halaman {page}
            </span>
          ) : (
            <span className="text-xs text-slate-600 font-medium px-1">
              Halaman {page} dari {totalPages}
            </span>
          )}
          <button
            type="button"
            disabled={
              isLoading ||
              (debouncedSearchQuery ? methods.length < 5 : page >= totalPages)
            }
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
      </div>

      {/* Modal Tambah */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tambah Metode Transaksi</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} method='POST' className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                  Nama Metode Pembayaran
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Tunai, QRIS, Transfer Mandiri"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  autoFocus
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {selectedEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Ubah Metode Transaksi</h3>
              <button
                type="button"
                onClick={() => setSelectedEditItem(null)}
                disabled={isSubmitting}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                  Nama Metode Pembayaran
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Tunai, QRIS, Transfer Mandiri"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  autoFocus
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEditItem(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      <DeleteCard
        isOpen={!!selectedDeleteItem}
        onClose={() => setSelectedDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Hapus Metode Transaksi"
        description="Apakah Anda yakin ingin menghapus metode pembayaran ini?"
        itemName={selectedDeleteItem?.name}
      />
    </div>
  )
}
