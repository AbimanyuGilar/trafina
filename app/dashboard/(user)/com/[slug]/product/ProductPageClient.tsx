'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addProduct, editProduct, deleteProduct, addCategory, deleteCategory } from './actions'
import { Search, Plus, Edit, Trash2, AlertTriangle, X, Check, Image as ImageIcon, Upload } from 'lucide-react'
import Loading from '@/components/loading'
import DeleteCard from '@/components/deleteCard'
import Dropdown from '@/components/Dropdown'

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
  image?: string | null
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

// Helper to get image URL from Supabase storage
const getProductImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return '/product.jpeg'
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  return `${baseUrl}/storage/v1/object/public/public_image/${cleanPath}`
}

export default function ProductPageClient({
  orgId,
  initialProducts,
  categories: initialCategories
}: ProductPageClientProps) {
  const router = useRouter()

  // States
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  // Sync categories prop
  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  // Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isLoadingAddCategory, setIsLoadingAddCategory] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null)
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  // Product Modal states
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
  const [formImage, setFormImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Open modal for add
  const handleOpenAddModal = () => {
    setCurrentProduct(null)
    setName('')
    setCategoryName(categories[0]?.name || '')
    setBuyPrice('')
    setPrice('')
    setUnit('pcs')
    setStock('')
    setFormImage(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  // Open modal for edit
  const handleOpenEditModal = (product: ProductWithCategory) => {
    setCurrentProduct(product)
    setName(product.name)
    setCategoryName(product.categories[0]?.category.name || '')
    setBuyPrice(product.buyPrice?.toString() ?? '0')
    setPrice(product.price?.toString() ?? '0')
    setUnit(product.unit)
    setStock(product.stock?.toString() ?? '0')
    setFormImage(null)
    setImagePreview(product.image ? getProductImageUrl(product.image) : null)
    setIsModalOpen(true)
  }

  // Open delete dialog
  const handleOpenDeleteModal = (product: ProductWithCategory) => {
    setCurrentProduct(product)
    setIsDeleteOpen(true)
  }

  // Handle Image File Input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5 MB')
      return
    }

    setFormImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Submit Handler (Add/Edit Product)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return toast.error("Nama produk harus diisi")
    if (!categoryName.trim()) return toast.error("Kategori harus diisi")
    if (!buyPrice || Number(buyPrice) < 0) return toast.error("Harga beli tidak valid")
    if (!price || Number(price) < 0) return toast.error("Harga jual tidak valid")
    if (!unit.trim()) return toast.error("Satuan harus diisi")
    if (stock === '' || Number(stock) < 0) return toast.error("Stok tidak valid")

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('category', categoryName.trim())
    formData.append('buyPrice', buyPrice)
    formData.append('price', price)
    formData.append('unit', unit.trim())
    formData.append('stock', stock)
    if (formImage) {
      formData.append('image', formImage)
    } else if (currentProduct && !imagePreview && currentProduct.image) {
      formData.append('removeImage', 'true')
    }

    try {
      let result
      if (currentProduct) {
        result = await editProduct(orgId, currentProduct.id, formData)
      } else {
        result = await addProduct(orgId, formData)
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

  // Category Add Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      toast.error("Nama kategori harus diisi")
      return
    }

    setIsLoadingAddCategory(true)
    try {
      const result = await addCategory(newCategoryName, orgId)
      if (result.success && result.data) {
        toast.success("Kategori berhasil ditambahkan!")
        setCategories(prev => [result.data, ...prev])
        setNewCategoryName('')
        router.refresh()
      } else {
        toast.error(result.message || "Gagal menambahkan kategori.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan saat menambahkan kategori.")
    } finally {
      setIsLoadingAddCategory(false)
    }
  }

  // Show Category Delete Confirmation
  const showDeleteCategoryModal = (cat: ProductCategory) => {
    setCategoryToDelete(cat)
    setIsDeleteCategoryModalOpen(true)
  }

  // Category Delete Handler
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    setIsDeletingCategory(true)

    try {
      const result = await deleteCategory(categoryToDelete.id, orgId)
      if (result.success) {
        toast.success("Kategori berhasil dihapus!")
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
        if (selectedCategory === categoryToDelete.name) {
          setSelectedCategory('ALL')
        }
        setIsDeleteCategoryModalOpen(false)
        setCategoryToDelete(null)
        router.refresh()
      } else {
        toast.error(result.message || "Gagal menghapus kategori.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan saat menghapus kategori.")
    } finally {
      setIsDeletingCategory(false)
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
          <div className="min-w-44">
            <Dropdown
              options={[
                { value: 'ALL', label: 'Semua Kategori' },
                ...categories.map((c) => ({ value: c.name, label: c.name, key: c.id }))
              ]}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Semua Kategori"
            />
          </div>

          {/* Atur Kategori Button */}
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Edit size={15} strokeWidth={2} />
            <span>Atur Kategori</span>
          </button>

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
                  <th scope="col" className="px-6 py-4">Produk</th>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getProductImageUrl(p.image)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-semibold text-slate-900">{p.name}</span>
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {currentProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Foto Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                  Foto Produk (Opsional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-slate-400" size={28} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs cursor-pointer transition">
                      <Upload size={14} />
                      <span>{imagePreview ? 'Ganti Foto' : 'Unggah Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormImage(null)
                          setImagePreview(null)
                        }}
                        className="block text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Maksimal ukuran file: 5 MB (PNG, JPG, JPEG, WEBP)
                    </p>
                  </div>
                </div>
              </div>

              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Susu Aren"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Kategori</label>
                <Dropdown
                  options={categories.map((c) => ({
                    value: c.name,
                    label: c.name,
                    key: c.id
                  }))}
                  value={categoryName}
                  onChange={setCategoryName}
                  placeholder="Pilih Kategori"
                />
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
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
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
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
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
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
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
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-slate-200 rounded-xl cursor-pointer"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all duration-200 rounded-xl shadow-xs cursor-pointer min-w-24"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loading size={16} />
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ATUR KATEGORI MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Atur Kategori Produk</h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nama Kategori Baru
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Contoh: Makanan, Minuman, Snack"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  disabled={isLoadingAddCategory}
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer min-w-32"
                >
                  {isLoadingAddCategory ? (
                    <div className="flex items-center gap-2">
                      <Loading size={16} />
                      <span>Menambahkan...</span>
                    </div>
                  ) : (
                    <span>Tambah Kategori</span>
                  )}
                </button>
              </div>
            </form>

            {/* List Kategori */}
            <div className="border-t border-slate-100 p-6 bg-slate-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Daftar Kategori ({categories.length})
              </h4>
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada kategori yang terdaftar.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs"
                    >
                      <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => showDeleteCategoryModal(cat)}
                        className="text-red-500 hover:bg-red-50 p-1.5 cursor-pointer rounded-lg transition"
                        title="Hapus Kategori"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      <DeleteCard
        isOpen={isDeleteCategoryModalOpen}
        isLoading={isDeletingCategory}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false)
          setCategoryToDelete(null)
        }}
        onConfirm={handleDeleteCategory}
        title="Hapus Kategori Produk"
        description="Apakah Anda yakin ingin menghapus kategori ini? Produk yang memiliki kategori ini akan tetap ada."
        itemName={categoryToDelete?.name}
      />

      {/* Delete Product Confirmation Dialog */}
      <DeleteCard
        isOpen={isDeleteOpen}
        isLoading={isSubmitting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Produk"
        description="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        itemName={currentProduct?.name}
      />

    </div>
  )
}

