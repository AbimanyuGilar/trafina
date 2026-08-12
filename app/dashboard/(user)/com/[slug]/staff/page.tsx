import { requireRoles } from '@/lib/auth-guard'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import StaffList from './staffList'

const StaffPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  // 1. Proteksi Halaman (Role Guard)
  const session = await requireRoles(['USER'])

  const { slug } = await params

  // 2. Ambil data organisasi beserta daftar anggotanya dari server
  const companyData = await auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationSlug: slug },
  })

  if (!companyData) {
    redirect('/dashboard')
  }

  // 3. Transformasi data agar hanya mengirim nama dan email
  const staffList = companyData.members?.map((member) => ({
    id: member.id,
    name: member.user.name,
    email: member.user.email,
    role: member.role
  })) || []

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
      <StaffList initialStaff={staffList} user={session.user} />
    </div>
  )
}

export default StaffPage