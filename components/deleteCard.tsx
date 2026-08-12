'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteCardProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
}

export default function DeleteCard({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  description = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  itemName,
  isLoading = false,
}: DeleteCardProps) {
  const [mounted, setMounted] = useState(false)

  // Pastikan komponen sudah di-mount di browser (untuk avoid SSR error pada Portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock scroll pada body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  // createPortal melempar elemen ini langsung ke root <body>
  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* Container Modal / Card */}
      <div 
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 space-y-5 p-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header & Close Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 shrink-0">
            <AlertTriangle size={24} strokeWidth={2} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Text Body */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          {/* Badge Nama Item */}
          {itemName && (
            <div className="pt-1">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-800 font-mono tracking-tight break-all">
                {itemName}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}