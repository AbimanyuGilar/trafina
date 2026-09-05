'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Phone, 
  Save, 
  X,
  Loader2
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { generateUniqueSlug } from '@/lib/generate-slug'
import { toast } from 'sonner'
import NProgress from 'nprogress'
import { createInitialData } from './actions'

export default function NewCompanyForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // State untuk data form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { name, phone, address } = formData
    const slug = generateUniqueSlug(name)

    const { data, error } = await authClient.organization.create({
      name,
      slug,
      metadata: {
        phone,
        address,
      },
      userId,
      keepCurrentActiveOrganization: false,
    });
    
    if (error) {
      toast.error(error.message)
    } else {
      await createInitialData(data)
      toast.success("Toko berhasil ditambahkan")

      NProgress.start()
      router.push(`/dashboard`)
    }

    setIsLoading(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
          
          {/* Section: Informasi Utama */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Toko */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Nama Toko <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Contoh: Toko Berkah Jaya"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Opsional
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>
          
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Telepon */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                  <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Alamat */}
          <div>
            <div className="space-y-1.5">
              <label htmlFor="address" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Alamat
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Jl. Sudirman No. 123, Jakarta..."
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <X size={16} />
            <span>Batal</span>
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Toko</span>
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}