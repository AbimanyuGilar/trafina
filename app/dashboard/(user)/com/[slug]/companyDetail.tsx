'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar, 
  Edit3, 
  Trash2, 
  Users, 
  FileText,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import DeleteCard from '@/components/deleteCard'
import NProgress from 'nprogress'
import { useRouter } from 'next/navigation'

export default function CompanyDetail({ companyData }: { companyData: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview')

  const [showDeleteCard, setShowDeleteCard] = useState<boolean>(false)

  const [isDeleteting, setIsDeleteting] = useState(false)

  const router = useRouter()
  
  async function handleDelete() {
    setShowDeleteCard(true)
  }

  async function deleteCompany(orgId: string) {
    setIsDeleteting(true)
    
    const { data, error } = await authClient.organization.delete({
      organizationId: orgId, // required
    });

    await authClient.organization.setActive({
      organizationId: null,
    });

    window.location.href = '/dashboard/com'
  }

  return (
    <div className="w-full space-y-6">
      <DeleteCard isLoading={isDeleteting} isOpen={showDeleteCard} onClose={() => setShowDeleteCard(false)} description={'Apakah anda yakin ingin menghapus perusahaan ini?'} onConfirm={() => deleteCompany(companyData.id)} />
      {/* 1. Header Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {companyData.name}
              </h1>
            </div>
              <p className='text-sm text-slate-500'>(Kamu sebagai {companyData.role === 'owner' ? 'pemilik' : 'karyawan'})</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href={`/edit/company/${companyData.slug}`} className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all cursor-pointer">
            <Edit3 size={16} strokeWidth={1.75} />
            <span>Edit</span>
          </Link>
          <button onClick={handleDelete} className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg shadow-sm transition-all cursor-pointer">
            <Trash2 size={16} strokeWidth={1.75} />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Karyawan</p>
            <p className="text-lg font-semibold text-slate-900">{companyData.members.length - 1}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={24} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Toko</p>
            <p className="text-lg font-semibold text-slate-900">0</p>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Informasi Umum
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Aktivitas Terakhir
          </button>
        </nav>
      </div>

      {/* 4. Tab Content: Informasi Umum */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kontak & Lokasi */}
          {(companyData.metadata.email || companyData.metadata.phone || companyData.metadata.website) && (
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Informasi Kontak
              </h2>
              <div className="space-y-3.5 text-sm">
                {companyData.metadata.email && (
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Email Resmi</p>
                      <a href={`mailto:${companyData.metadata.email}`} className="text-blue-600 hover:underline font-medium">
                        {companyData.metadata.email}
                      </a>
                    </div>
                  </div>
                )}

                {companyData.metadata.phone && (
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Telepon / WhatsApp</p>
                      <p className="text-slate-800 font-medium">{companyData.metadata.phone}</p>
                    </div>
                  </div>
                )}

                {companyData.metadata.website && (
                  <div className="flex items-start gap-3">
                    <Globe size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Situs Web</p>
                      <a href={companyData.metadata.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                        {companyData.metadata.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alamat & Sistem */}
          {(companyData.metadata.address || companyData.createdAt) && (
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Alamat & Registrasi
              </h2>
              <div className="space-y-3.5 text-sm">
                {companyData.metadata.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Alamat Lengkap</p>
                      <p className="text-slate-800 font-medium leading-relaxed">{companyData.metadata.address}</p>
                    </div>
                  </div>
                )}

                {companyData.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Tanggal Terdaftar</p>
                      <p className="text-slate-800 font-medium">
                        {companyData?.createdAt 
                          ? new Date(companyData.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Aktivitas */}
      {activeTab === 'activity' && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm text-center py-12">
          <p className="text-sm text-slate-500">Belum ada riwayat aktivitas untuk perusahaan ini.</p>
        </div>
      )}
    </div>
  )
}