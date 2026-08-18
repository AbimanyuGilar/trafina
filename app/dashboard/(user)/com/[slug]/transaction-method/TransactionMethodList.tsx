'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2
} from 'lucide-react'
import DeleteCard from '@/components/deleteCard'
import { toast } from 'sonner'
import { addTransactionMethod, deleteTransactionMethod, updateTransactionMethod } from './actions'

export interface TransactionMethodItem {
  id: string
  name: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export default function TransactionMethodList({ initialTransactionMethods }: {initialTransactionMethods: TransactionMethodItem[]}) {
  const [methods, setMethods] = useState<TransactionMethodItem[]>(initialTransactionMethods)
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedEditItem, setSelectedEditItem] = useState<TransactionMethodItem | null>(null)
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<TransactionMethodItem | null>(null)

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')

  // Filter pencarian
  const filteredMethods = methods.filter((method) =>
    method.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      setMethods((prev) => [
        ...prev,
        newMethod?.data as TransactionMethodItem,
      ])
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

    const updated = await updateTransactionMethod({newName: selectedEditItem.name, methodId: selectedEditItem.id})
    
    setMethods((prev) =>
      prev.map((item) =>
        item.id === selectedEditItem.id
          ? { ...item, name: formName.trim() }
          : item
      )
    )
    
    setSelectedEditItem(null)
    toast.success(`Metode berhasil diperbarui menjadi "${formName}"`)
    setIsSubmitting(false)
  }

  // Konfirmasi Hapus
  const handleDeleteConfirm = async () => {
    if (!selectedDeleteItem) return
    setIsDeleting(true)
    const deleted = await deleteTransactionMethod(selectedDeleteItem)

    if (deleted.success) {
      setMethods((prev) => prev.filter((item) => item.id !== selectedDeleteItem.id))
      toast.success(`Metode "${selectedDeleteItem.name}" berhasil dihapus`)
    } else {
      toast.error(deleted.message)
    }

    setSelectedDeleteItem(null)
    setIsDeleting(false)
  }

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
        {filteredMethods.length === 0 ? (
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
                {filteredMethods.map((method) => (
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
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedDeleteItem(method)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={15} />
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

      {/* Footer Info */}
      <div className="text-xs text-slate-500 px-1">
        Menampilkan <span className="font-semibold text-slate-700">{filteredMethods.length}</span> dari{' '}
        <span className="font-semibold text-slate-700">{methods.length}</span> metode
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
