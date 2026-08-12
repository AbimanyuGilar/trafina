import { requirePermission } from '@/lib/auth-guard'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import StaffList from './staffList'
import prisma from '@/lib/prisma'

const StaffPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params

  // 1. Proteksi Halaman & Izin Akses (Role + Permission Guard)
  const { session } = await requirePermission('manage_staff', slug)

  // 2. Ambil data organisasi beserta daftar anggotanya dari server
  const companyData = await auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationSlug: slug },
  })

  if (!companyData) {
    redirect('/dashboard')
  }

  // Force reload client types
  // 3. Ambil data permissions dari database untuk member di organisasi ini
  const dbMembers = await prisma.member.findMany({
    where: {
      organizationId: companyData.id,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  // 4. Transformasi data agar menyertakan permissions
  const staffList = companyData.members?.map((member) => {
    const dbMember = dbMembers.find((m) => m.id === member.id)
    const permissions = dbMember?.permissions.map((p) => p.permission.name) || []
    
    return {
      id: member.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      permissions: permissions,
    }
  }) || []

  // 5. Ambil semua permissions yang tersedia di database
  let allPermissions = await prisma.permission.findMany()

  const defaults = [
    'manage_inventory',
    'manage_transactions',
    'manage_staff',
    'manage_manual_transaction',
    'manage_cashier',
    'manage_transaction_history'
  ]

  // Pastikan semua default permission ada di database
  let needRefresh = false
  for (const name of defaults) {
    const exists = allPermissions.some((p) => p.name === name)
    if (!exists) {
      await prisma.permission.create({
        data: { name },
      })
      needRefresh = true
    }
  }

  if (needRefresh) {
    allPermissions = await prisma.permission.findMany()
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Manage Karyawan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar karyawan yang terdaftar di {companyData.name}
          </p>
        </div>
      </div>

      {/* Tabel Data Karyawan */}
      <StaffList 
        initialStaff={staffList} 
        allPermissions={allPermissions.map((p) => ({ id: p.id, name: p.name }))}
        user={session.user} 
      />
    </div>
  )
}

export default StaffPage