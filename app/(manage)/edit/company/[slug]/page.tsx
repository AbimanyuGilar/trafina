import { requireRoles } from '@/lib/auth-guard'
import EditCompanyForm from './editCompanyForm'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { getFullOrganization } from '@/lib/organizations'

const EditCompanyPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const session = await requireRoles(["USER"])
  const userId = session.user.id
  const { slug } = await params
  const companyData = await getFullOrganization({ organizationSlug: slug })

  return (
    <div className="w-full space-y-6 p-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </Link>
          <div className='flex items-center'>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Edit Perusahaan
            </h1>
            <Building2 size={18} className="text-blue-600 ml-4" />
          </div>
        </div>
      </div>

      <EditCompanyForm userId={userId} companyData={companyData}/>
    </div>
  )
}

export default EditCompanyPage