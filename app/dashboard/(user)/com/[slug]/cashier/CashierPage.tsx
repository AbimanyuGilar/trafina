'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductCategory, PaymentMethod } from '@/generated/prisma/client'
import { 
  Search, 
  ShoppingBag, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Banknote, 
  QrCode, 
  CreditCard, 
  CheckCircle, 
  X, 
  Printer, 
  RefreshCw,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { createTransaction } from './actions'

type ProductWithCategories = Product & {
  categories: ProductCategory[];
};

// Helper Format Rupiah
const formatRupiah = (amount: number | bigint) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(amount))
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


// Generate dynamic cash suggestions based on total bill
const getQuickAmounts = (total: number) => {
  if (total <= 0) return []
  const suggestions = new Set<number>()
  suggestions.add(total) // Exact amount ("Pas")
  
  // Standard bills in IDR
  const standardBills = [10000, 20000, 50000, 100000]
  
  for (const bill of standardBills) {
    if (bill > total) {
      suggestions.add(bill)
    }
  }

  // Next roundings
  const roundTo10k = Math.ceil(total / 10000) * 10000
  if (roundTo10k > total) suggestions.add(roundTo10k)
  
  const roundTo50k = Math.ceil(total / 50000) * 50000
  if (roundTo50k > total) suggestions.add(roundTo50k)
  
  const roundTo100k = Math.ceil(total / 100000) * 100000
  if (roundTo100k > total) suggestions.add(roundTo100k)

  return Array.from(suggestions).sort((a, b) => a - b).slice(0, 5) // max 5 options
}

const CashierPage = ({ products, categories, paymentMethods }: { products: ProductWithCategories[], categories: ProductCategory[], paymentMethods: PaymentMethod[] }) => {
  const router = useRouter()
  const cartRef = useRef<HTMLDivElement>(null)

  // Local products state to sync with props when database reloads
  const [localProducts, setLocalProducts] = useState<ProductWithCategories[]>(products)
  
  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  
  // Cart state
  const [cart, setCart] = useState<{ product: ProductWithCategories; quantity: number }[]>([])
  
  // Checkout & Payment states
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods[0]?.name ?? '')
  const [cashReceived, setCashReceived] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Success receipt modal state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState<any>(null)
  // Track cash received for receipt printing
  const [receiptCashReceived, setReceiptCashReceived] = useState<string>('')

  // Sync props to local state
  useEffect(() => {
    setLocalProducts(products)
  }, [products])

  // Reset category filter if selected category is not found in categories list
  useEffect(() => {
    if (selectedCategory !== 'ALL' && !categories.some(c => c.id === selectedCategory)) {
      setSelectedCategory('ALL')
    }
  }, [categories, selectedCategory])

  // Sync paymentMethod default when paymentMethods prop loads
  useEffect(() => {
    if (paymentMethods.length > 0) {
      setPaymentMethod(prev => {
        const stillValid = paymentMethods.some(m => m.name === prev)
        return stillValid ? prev : (paymentMethods[0]?.name ?? '')
      })
    }
  }, [paymentMethods])

  // Cart operations
  const handleAddToCart = (product: ProductWithCategories) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id)
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity
      if (product.trackStock && currentQty + 1 > product.stock) {
        toast.warning(`Stok ${product.name} tidak mencukupi!`)
        return
      }
      const newCart = [...cart]
      newCart[existingIndex].quantity += 1
      setCart(newCart)
    } else {
      if (product.trackStock && product.stock < 1) {
        toast.warning(`Stok ${product.name} habis!`)
        return
      }
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const handleIncrement = (productId: string) => {
    const existingIndex = cart.findIndex(item => item.product.id === productId)
    if (existingIndex > -1) {
      const item = cart[existingIndex]
      if (item.product.trackStock && item.quantity + 1 > item.product.stock) {
        toast.warning(`Stok ${item.product.name} tidak mencukupi!`)
        return
      }
      const newCart = [...cart]
      newCart[existingIndex].quantity += 1
      setCart(newCart)
    }
  }

  const handleDecrement = (productId: string) => {
    const existingIndex = cart.findIndex(item => item.product.id === productId)
    if (existingIndex > -1) {
      const item = cart[existingIndex]
      if (item.quantity === 1) {
        setCart(cart.filter(i => i.product.id !== productId))
      } else {
        const newCart = [...cart]
        newCart[existingIndex].quantity -= 1
        setCart(newCart)
      }
    }
  }

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const handleClearCart = () => {
    setCart([])
  }

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [cart])

  const quickAmounts = useMemo(() => {
    return getQuickAmounts(subtotal)
  }, [subtotal])

  const cashReceivedNum = useMemo(() => {
    const parsed = parseInt(cashReceived, 10)
    return isNaN(parsed) ? 0 : parsed
  }, [cashReceived])

  const changeAmount = useMemo(() => {
    return cashReceivedNum - subtotal
  }, [cashReceivedNum, subtotal])

  // Handle cash input (digits only)
  const handleCashReceivedChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '')
    setCashReceived(sanitized)
  }

  // Checkout button condition
  const isCheckoutDisabled = useMemo(() => {
    if (cart.length === 0) return true
    if (paymentMethod === 'Tunai' && cashReceivedNum < subtotal) return true
    return false
  }, [cart, paymentMethod, cashReceivedNum, subtotal])

  // Submit checkout to server action
  const handleCheckout = async () => {
    if (isCheckoutDisabled || isSubmitting) return

    setIsSubmitting(true)
    
    // In actions.ts: totalPrice = products.reduce((accumulator, product) => product.price + accumulator, 0)
    // So we pass 'price' as the subtotal of the items (unitPrice * amount) to ensure the server calculates total correctly.
    const payloadProducts = cart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price * item.quantity,
      amount: item.quantity
    }))

    try {
      const result = await createTransaction({
        products: payloadProducts,
        paymentMethod
      })

      if (result.success && result.data) {
        toast.success('Transaksi kasir berhasil diproses!')
        setCompletedTransaction(result.data)
        setReceiptCashReceived(cashReceived) // lock cash input for printable receipt
        setIsReceiptModalOpen(true)
        
        // Reset local cart and inputs
        setCart([])
        setCashReceived('')
        setIsMobileCartOpen(false)
        
        // Refresh Next.js server components to reload fresh stocks
        router.refresh()
      } else {
        toast.error(result.message || 'Gagal memproses transaksi.')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi server saat memproses transaksi.')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Client-side search and category filters
  const filteredProducts = useMemo(() => {
    return localProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'ALL' || product.categories.some(cat => cat.id === selectedCategory)
      return matchesSearch && matchesCategory
    })
  }, [localProducts, searchQuery, selectedCategory])

  const scrollToCart = () => {
    cartRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Open printing in a hidden/popup window for clean standard thermal receipt formatting
  const handlePrintReceipt = (transactionData: any) => {
    if (!transactionData) return

    const printWindow = window.open('', '_blank', 'width=350,height=600')
    if (!printWindow) {
      toast.error('Gagal membuka jendela cetak. Pastikan izin pop-up browser diaktifkan.')
      return
    }

    let items = []
    try {
      items = JSON.parse(transactionData.detail || '[]')
    } catch (e) {
      console.error('Error parsing details for receipt printing', e)
    }

    const itemsHtml = items.map((item: any) => {
      const qty = item.amount || 1
      const lineTotal = item.price || 0
      const unitPrice = qty > 0 ? lineTotal / qty : 0
      return `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; line-height: 1.4;">
          <div style="text-align: left; max-width: 65%; word-break: break-all;">
            <div>${item.name}</div>
            <div style="color: #666; font-size: 10px;">${qty} x ${formatRupiah(unitPrice)}</div>
          </div>
          <div style="text-align: right; min-width: 35%; font-weight: bold; align-self: flex-end;">
            ${formatRupiah(lineTotal)}
          </div>
        </div>
      `
    }).join('')

    const dateStr = new Date(transactionData.createdAt).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const changeHtml = transactionData.paymentMethod === 'Tunai' && receiptCashReceived
      ? `
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <span>Uang Diterima</span>
          <span>${formatRupiah(Number(receiptCashReceived))}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px; font-weight: bold;">
          <span>Kembalian</span>
          <span>${formatRupiah(Number(receiptCashReceived) - transactionData.totalPrice)}</span>
        </div>
      `
      : ''

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk - ${transactionData.id}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              margin: 0;
              width: 300px;
              color: #000;
              background-color: #fff;
            }
            .text-center { text-align: center; }
            .header { margin-bottom: 15px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .items { margin: 12px 0; }
            .totals { font-size: 12px; line-height: 1.5; }
            .footer { margin-top: 25px; font-size: 11px; color: #333; }
          </style>
        </head>
        <body>
          <div class="text-center header">
            <h3 style="margin: 0 0 4px 0; font-size: 16px;">KASIR TOKO</h3>
            <div style="font-size: 11px;">Struk Pembayaran POS</div>
            <div style="font-size: 10px; color: #555; margin-top: 4px;">ID: ${transactionData.id}</div>
            <div style="font-size: 10px; color: #555;">${dateStr}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="items">
            ${itemsHtml}
          </div>
          
          <div class="divider"></div>
          
          <div class="totals">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
              <span>TOTAL BELANJA</span>
              <span>${formatRupiah(transactionData.totalPrice)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 6px;">
              <span>Metode Pembayaran</span>
              <span>${transactionData.paymentMethod}</span>
            </div>
            ${changeHtml}
          </div>
          
          <div class="divider"></div>
          
          <div class="text-center footer">
            <div>Terima Kasih Atas Kunjungan Anda</div>
            <div style="margin-top: 6px; font-weight: bold; letter-spacing: 1px;">LUNAS</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const renderCart = (isMobile: boolean = false) => {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden flex flex-col ${isMobile ? 'h-full max-h-[88dvh]' : 'border border-slate-200 shadow-xs'}`}>
        {/* Cart Header */}
        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-slate-500" />
            <span className="font-bold text-slate-900 text-sm">Item Transaksi</span>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100"
            >
              Hapus Semua
            </button>
            {isMobile && (
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items & Checkout Body Scroll Container */}
        <div className={`overflow-y-auto flex-1 min-h-0 divide-y divide-slate-100 ${isMobile ? 'max-h-[calc(88dvh-65px)]' : 'max-h-[calc(100vh-220px)]'}`}>
          {/* Cart Items List */}
          <div className="divide-y divide-slate-100 px-5">
            {cart.map((item) => (
              <div key={item.product.id} className="py-3.5 flex items-start gap-3 animate-in fade-in duration-100">
                {/* Product Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 flex items-center justify-center mt-0.5">
                  <img
                    src={getProductImageUrl(item.product.image)}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/product.png'
                    }}
                  />
                </div>

                {/* Item Details & Stepper */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 text-left">
                      <span className="block font-semibold text-slate-900 text-sm truncate">
                        {item.product.name}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        {formatRupiah(item.product.price)} <span className="text-slate-400">/ unit</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer shrink-0 -mr-1"
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Quantity Adjustment & Total Line Price */}
                  <div className="flex items-center justify-between mt-2.5 pt-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>

                    {/* Stepper Buttons */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => handleDecrement(item.product.id)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200/80 hover:bg-slate-100 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus size={12} strokeWidth={2.5} />
                      </button>
                      
                      <span className="text-xs font-bold text-slate-800 min-w-[24px] text-center select-none">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleIncrement(item.product.id)}
                        disabled={item.product.trackStock && item.quantity >= item.product.stock}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200/80 hover:bg-slate-100 active:scale-95 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        aria-label="Tambah jumlah"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Calculation and Form Section */}
          <div className="p-5 bg-slate-50/50 space-y-4">
            {/* Total pricing details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Subtotal Belanja</span>
                <span className="font-semibold text-slate-700">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-2 border-t border-dashed border-slate-200">
                <span>Total Pembayaran</span>
                <span className="text-lg text-blue-600 font-extrabold">{formatRupiah(subtotal)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 text-left">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.name
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method.name)
                        if (method.name !== 'Tunai') {
                          setCashReceived('')
                        }
                      }}
                      className={`py-2 px-2 flex flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      {method.name === 'Tunai' ? (
                        <Banknote size={15} strokeWidth={2} />
                      ) : method.name === 'QRIS' ? (
                        <QrCode size={15} strokeWidth={2} />
                      ) : (
                        <CreditCard size={15} strokeWidth={2} />
                      )}
                      <span className="truncate max-w-full">{method.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cash payment details */}
            {paymentMethod === 'Tunai' && (
              <div className="space-y-2 pt-2 border-t border-slate-200/60 animate-in fade-in duration-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 text-left">
                  Uang Diterima
                </label>
                
                <div className="relative text-left">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">Rp</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={cashReceived}
                    onChange={(e) => handleCashReceivedChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-left"
                  />
                </div>

                {/* Quick Cash suggestion badges */}
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCashReceived(amount.toString())}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                    >
                      {amount === subtotal ? 'Uang Pas' : formatRupiah(amount)}
                    </button>
                  ))}
                </div>

                {/* Change calculations display */}
                {cashReceivedNum > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold bg-white border-slate-200 mt-2">
                    <span className="text-slate-500">Kembalian</span>
                    {changeAmount >= 0 ? (
                      <span className="text-sm font-bold text-emerald-600">
                        {formatRupiah(changeAmount)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-rose-600 font-medium">
                        Kurang {formatRupiah(Math.abs(changeAmount))}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Final Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckoutDisabled || isSubmitting}
              className={`w-full font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                isCheckoutDisabled || isSubmitting
                  ? 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:shadow-md active:translate-y-px'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Memproses Transaksi...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} strokeWidth={2.5} />
                  <span>Selesaikan Transaksi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 bg-slate-50/50 min-h-screen pb-12">
      {/* POS Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kasir</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola penjualan produk dengan mudah dan efisien</p>
        </div>
        <div className="text-left md:text-right text-xs text-slate-500 font-medium">
          Hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Toolbar: Search and Category Filtering */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs text-left">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-left"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categories Pills scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 w-full sm:w-auto no-scrollbar justify-start">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semua Produk
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual-Column Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Products Grid */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-100">
                <ShoppingBag size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Tidak ada produk yang cocok dengan pencarian atau filter kategori yang Anda pilih.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const cartItem = cart.find(item => item.product.id === product.id)
                const quantityInCart = cartItem ? cartItem.quantity : 0
                const isOutOfStock = product.trackStock && product.stock <= 0
                const isLowStock = product.trackStock && product.stock > 0 && product.stock <= 5

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                    className={`bg-white rounded-xl border p-4 shadow-xs transition-all relative select-none flex flex-col justify-between h-full group ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed border-slate-200'
                        : 'cursor-pointer hover:shadow-md hover:border-blue-200 border-slate-200 active:scale-[0.98]'
                    } ${quantityInCart > 0 ? 'ring-2 ring-blue-600/20 border-blue-600' : ''}`}
                  >
                    {/* Cart Quantity Badge indicator */}
                    {quantityInCart > 0 && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white font-bold text-xs rounded-full size-6 flex items-center justify-center shadow-md animate-in zoom-in-50">
                        {quantityInCart}x
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Product Image */}
                      <div className="w-full h-32 rounded-lg bg-slate-50 overflow-hidden relative border border-slate-100/60 flex items-center justify-center">
                        <img
                          src={getProductImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/product.png'
                          }}
                        />
                      </div>

                      {/* Product Categories */}
                      <div className="flex flex-wrap gap-1 justify-start">
                        {product.categories.map((c) => (
                          <span key={c.id} className="text-[9px] font-bold tracking-wider uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            {c.name}
                          </span>
                        ))}
                        {product.categories.length === 0 && (
                          <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            Umum
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[40px] text-left">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-end justify-between">
                      {/* Price & Stock status */}
                      <div className="text-left">
                        <span className="block font-bold text-slate-900 text-sm">
                          {formatRupiah(product.price)}
                        </span>
                        <span className={`text-[11px] mt-0.5 block ${
                          !product.trackStock
                            ? 'text-slate-400'
                            : isOutOfStock
                            ? 'text-rose-600 font-semibold'
                            : isLowStock
                            ? 'text-amber-600 font-medium'
                            : 'text-slate-400'
                        }`}>
                          {!product.trackStock ? '' : isOutOfStock ? 'Stok Habis' : `Stok: ${product.stock}`}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className={`p-1.5 rounded-lg border transition-all ${
                        isOutOfStock
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : quantityInCart > 0
                          ? 'bg-blue-50 border-blue-200 text-blue-600 group-hover:bg-blue-100'
                          : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-slate-100'
                      }`}>
                        <Plus size={14} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Checkout Cart - Hidden on Mobile */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6">
          {cart.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-100">
                <ShoppingCart size={26} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 text-base">Keranjang Kosong</h3>
                <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                  Pilih produk dari daftar di sebelah kiri untuk memulai pembuatan transaksi baru.
                </p>
              </div>
            </div>
          ) : (
            renderCart(false)
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile Screen sizes */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden bg-white border border-slate-200 rounded-2xl p-4 shadow-lg flex items-center justify-between animate-in slide-in-from-bottom duration-300">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Total ({cart.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
            <span className="text-base font-extrabold text-blue-600">{formatRupiah(subtotal)}</span>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart size={14} />
            <span>Lihat Keranjang</span>
          </button>
        </div>
      )}

      {/* Mobile Cart Modal Popup Drawer */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90dvh] overflow-hidden transform transition-all animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {cart.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="flex justify-end -mt-2 -mr-2">
                  <button
                    onClick={() => setIsMobileCartOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-100">
                  <ShoppingCart size={26} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-slate-900 text-base">Keranjang Kosong</h3>
                <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                  Pilih produk dari daftar untuk memulai transaksi baru.
                </p>
              </div>
            ) : (
              renderCart(true)
            )}
          </div>
        </div>
      )}

      {/* Checkout Receipt Success Modal */}
      {isReceiptModalOpen && completedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Body Container */}
            <div className="p-6 text-center">
              {/* Success Badge */}
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100 mb-3">
                <Check size={24} strokeWidth={3} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Transaksi Berhasil!</h3>
              <p className="text-xs text-slate-500 mt-1">Transaksi penjualan telah disimpan dan tercatat di sistem.</p>

              {/* Receipt metadata overview card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 my-5 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Transaksi:</span>
                  <span className="font-semibold text-slate-800 font-mono text-[10px]">{completedTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(completedTransaction.createdAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Pembayaran:</span>
                  <span className="font-semibold text-slate-800">{completedTransaction.paymentMethod}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Belanja:</span>
                  <span className="text-blue-600">{formatRupiah(completedTransaction.totalPrice)}</span>
                </div>
                
                {completedTransaction.paymentMethod === 'Tunai' && receiptCashReceived && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Uang Diterima:</span>
                      <span className="font-semibold text-slate-800">{formatRupiah(Number(receiptCashReceived))}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(Number(receiptCashReceived) - completedTransaction.totalPrice)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Transaksi Baru
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintReceipt(completedTransaction)}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Cetak Struk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CashierPage