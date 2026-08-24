'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addProduct, editProduct, deleteProduct } from './actions'
import { Search, Plus, Edit, Trash2, AlertTriangle, X, Check } from 'lucide-react'

interface ProductCategory {
  id: string
  name: string
}

interface ProductWithCategory {
  id: string
  name: string
  price: number
  buyPrice: number
  unit: string
  stock: number
  categories: {
    category: ProductCategory
  }[]
  createdAt: string
}

interface ProductPageClientProps {
  orgId: string
  initialProducts: ProductWithCategory[]
  categories: ProductCategory[]
}

export default function ProductPageClient({
  orgId,
  initialProducts,
  categories
}: ProductPageClientProps) {
  const router = useRouter()

  // States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<ProductWithCategory | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [stock, setStock] = useState('')

  // Open modal for add
  const handleOpenAddModal = () => {
    setCurrentProduct(null)
    setName('')
    setCategoryName('')
    setBuyPrice('')
    setPrice('')
    setUnit('pcs')
    setStock('')
    setIsModalOpen(true)
  }

  // Open modal for edit
  const handleOpenEditModal = (product: ProductWithCategory) => {
    setCurrentProduct(product)
    setName(product.name)
    setCategoryName(product.categories[0]?.category.name || '')
    setBuyPrice(product.buyPrice.toString())
    setPrice(product.price.toString())
    setUnit(product.unit)
    setStock(product.stock.toString())
    setIsModalOpen(true)
  }

  // Open delete dialog
  const handleOpenDeleteModal = (product: ProductWithCategory) => {
    setCurrentProduct(product)
    setIsDeleteOpen(true)
  }

  // Submit Handler (Add/Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return toast.error("Nama produk harus diisi")
    if (!categoryName.trim()) return toast.error("Kategori harus diisi")
    if (!buyPrice || Number(buyPrice) < 0) return toast.error("Harga beli tidak valid")
    if (!price || Number(price) < 0) return toast.error("Harga jual tidak valid")
    if (!unit.trim()) return toast.error("Satuan harus diisi")
    if (stock === '' || Number(stock) < 0) return toast.error("Stok tidak valid")

    setIsSubmitting(true)

    const payload = {
      name: name.trim(),
      category: categoryName.trim(),
      buyPrice: Number(buyPrice),
      price: Number(price),
      unit: unit.trim(),
      stock: Number(stock)
    }

    try {
      let result
      if (currentProduct) {
        result = await editProduct(orgId, currentProduct.id, payload)
      } else {
        result = await addProduct(orgId, payload)
      }

      if (result.success) {
        toast.success(currentProduct ? "Produk berhasil diubah!" : "Produk berhasil ditambahkan!")
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.message || "Gagal memproses produk.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan pada sistem.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Handler
  const handleDelete = async () => {
    if (!currentProduct) return
    setIsSubmitting(true)

    try {
      const result = await deleteProduct(orgId, currentProduct.id)
      if (result.success) {
        toast.success("Produk berhasil dihapus!")
        setIsDeleteOpen(false)
        router.refresh()
      } else {
        toast.error(result.message || "Gagal menghapus produk.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan pada sistem.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stats
  const totalProducts = initialProducts.length
  const totalStock = initialProducts.reduce((sum, p) => sum + p.stock, 0)
  const lowStockCount = initialProducts.filter(p => p.stock <= 5).length

  // Filtered Products
  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || p.categories.some(c => c.category.name === selectedCategory)
    const matchesLowStock = !showLowStockOnly || p.stock <= 5
    return matchesSearch && matchesCategory && matchesLowStock
  })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Daftar Produk
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola inventaris produk, stok barang, dan kategori produk
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 hover:scale-[1.02] transition-all duration-200 rounded-lg shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Jenis Produk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Total Jenis Produk</h3>
          <p className="text-3xl font-extrabold mt-1 text-slate-900">{totalProducts}</p>
        </div>

        {/* Total Unit Stok */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Total Unit Stok</h3>
          <p className="text-3xl font-extrabold mt-1 text-slate-900">{totalStock}</p>
        </div>

        {/* Stok Menipis Warning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Stok Menipis (≤ 5)</h3>
            <p className="text-3xl font-extrabold mt-1 text-rose-600">{lowStockCount}</p>
          </div>
          {lowStockCount > 0 && (
            <div className="p-2.5 rounded-full bg-rose-50 text-rose-600 animate-pulse">
              <AlertTriangle size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Opsi Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Toggle Stok Menipis */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border active:scale-95 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              showLowStockOnly 
                ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'
            }`}
          >
            <AlertTriangle size={15} />
            <span>Hanya Stok Menipis</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="px-6 py-4">Nama Produk</th>
                  <th scope="col" className="px-6 py-4">Kategori</th>
                  <th scope="col" className="px-6 py-4 text-right">Harga Beli</th>
                  <th scope="col" className="px-6 py-4 text-right">Harga Jual</th>
                  <th scope="col" className="px-6 py-4 text-center">Satuan</th>
                  <th scope="col" className="px-6 py-4 text-center">Stok</th>
                  <th scope="col" className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLowStock = p.stock <= 5
                  const categoryName = p.categories[0]?.category.name || 'Umum'

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500">
                        {formatRupiah(p.buyPrice)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-500">
                        {p.unit}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isLowStock 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {isLowStock && <AlertTriangle size={12} />}
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90 hover:scale-110 transition-all duration-150 rounded cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(p)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 hover:scale-110 transition-all duration-150 rounded cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-500">Silakan tambahkan produk baru atau ubah kriteria pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {currentProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Susu Aren"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Pilih atau ketik kategori baru"
                  list="existing-categories"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <datalist id="existing-categories">
                  {categories.map(c => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              {/* Harga Beli & Harga Jual */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Satuan & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    placeholder="pcs / kg / box"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-slate-200 rounded-lg cursor-pointer"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 rounded-lg shadow-sm cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Hapus Produk?</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk <span className="font-semibold text-slate-800">"{currentProduct?.name}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-slate-200 rounded-lg cursor-pointer"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 rounded-lg shadow-sm cursor-pointer"
              >
                {isSubmitting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
