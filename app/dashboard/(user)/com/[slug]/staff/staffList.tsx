'use client'

import { useState } from 'react'
import {
  Search,
  UserCheck,
  Mail,
  Pencil,
  Trash2,
  UserPlus,
  Loader2,
  X,
  Send,
} from 'lucide-react'
import DeleteCard from '@/components/deleteCard' // Path komponen DeleteCard Anda
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

export interface StaffItem {
  id: string
  name: string
  email: string
  role: string
}

interface StaffListProps {
  initialStaff: StaffItem[]
  user: any
}

export default function StaffList({ initialStaff, user }: StaffListProps) {
  const [staffList, setStaffList] = useState<StaffItem[]>(initialStaff)
  const [searchQuery, setSearchQuery] = useState('')

  // State untuk Modal Invite Karyawan
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  // State untuk Modal Delete
  const [selectedDeleteStaff, setSelectedDeleteStaff] = useState<StaffItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State untuk Modal Edit
  const [selectedEditStaff, setSelectedEditStaff] = useState<StaffItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Filter data berdasarkan nama atau email
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handler Undang Karyawan
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    setIsSendingInvite(true)
    try {
      const { data, error } = await authClient.organization.inviteMember({
        email: inviteEmail, // required
        role: "member", // required
        resend: true,
      });
      toast.success(`Undangan berhasil dikirim ke ${inviteEmail}`)
      setIsInviteOpen(false)
    } catch {
      toast.error('Gagal mengirim undangan')
    } finally {
      setIsSendingInvite(false)
    }
  }

  // Handler Hapus Karyawan
  const handleDeleteConfirm = async () => {
    if (!selectedDeleteStaff) return

    setIsDeleting(true)
    try {
      // TODO: Panggil Server Action / API backend di sini
      setStaffList((prev) => prev.filter((item) => item.id !== selectedDeleteStaff.id))
      setSelectedDeleteStaff(null)
    } catch (error) {
      console.error('Gagal menghapus karyawan:', error)
      alert('Terjadi kesalahan saat menghapus data.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handler Buka Modal Edit
  const handleOpenEdit = (staff: StaffItem) => {
    setSelectedEditStaff(staff)
    setEditName(staff.name)
    setEditEmail(staff.email)
  }

  // Handler Simpan Perubahan Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEditStaff) return

    setIsUpdating(true)
    try {
      // TODO: Panggil Server Action / API backend di sini
      setStaffList((prev) =>
        prev.map((item) =>
          item.id === selectedEditStaff.id
            ? { ...item, name: editName, email: editEmail }
            : item
        )
      )
      setSelectedEditStaff(null)
    } catch (error) {
      console.error('Gagal memperbarui karyawan:', error)
      alert('Terjadi kesalahan saat memperbarui data.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Tombol Undang Karyawan */}
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shrink-0"
        >
          <UserPlus size={16} strokeWidth={2} />
          <span>Undang Karyawan</span>
        </button>
      </div>

      {/* Card Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Karyawan tidak ditemukan
            </p>
            <p className="text-xs text-slate-500">
              Coba kata kunci pencarian yang berbeda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wide font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Nama Karyawan
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Kolom Nama */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0">
                          {staff.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="truncate">{staff.name}</span>
                        {staff.role === 'owner' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full">
                            Pemilik
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Kolom Email */}
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {staff.role !== 'owner' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(staff)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Karyawan"
                          >
                            <Pencil size={16} strokeWidth={1.75} />
                          </button>

                          {/* Tombol Delete */}
                          <button
                            type="button"
                            onClick={() => setSelectedDeleteStaff(staff)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Karyawan"
                          >
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Utama
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Total Count */}
      <div className="text-xs text-slate-500 px-1">
        Menampilkan <span className="font-semibold text-slate-700">{filteredStaff.length}</span> dari <span className="font-semibold text-slate-700">{staffList.length}</span> karyawan
      </div>

      {/* Modal Undang Karyawan */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                  <UserPlus size={18} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Undang Karyawan Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                disabled={isSendingInvite}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                  Email Karyawan
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={isSendingInvite}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSendingInvite ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Kirim Undangan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      <DeleteCard
        isOpen={!!selectedDeleteStaff}
        onClose={() => setSelectedDeleteStaff(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Hapus Karyawan"
        description="Apakah Anda yakin ingin menghapus karyawan ini dari organisasi? Akses karyawan akan dicabut."
        itemName={selectedDeleteStaff?.name}
      />
    </div>
  )
}