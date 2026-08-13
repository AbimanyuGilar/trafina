'use client'

import { Building2, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'

const UserDashboard = ({ companies, activeCompany }: { companies: any, activeCompany: any}) => {
	const router = useRouter()

	console.log(activeCompany)

	async function handleChangeCompany(organizationId: string) {
		NProgress.start()
		
		const { data, error } = await authClient.organization.setActive({
			organizationId,
		});
		
		router.push(`/dashboard/com/${data?.slug}`)

		router.refresh()
	}

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pilih Perusahaan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pilih salah satu perusahaan untuk mengelola dashboard Anda
          </p>
        </div>

        {/* Action Button */}
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
          <Plus size={18} strokeWidth={2} />
          <Link href="/new/company">Tambah Perusahaan</Link>
        </button>
      </div>

      {/* List Perusahaan */}
			{
				(
					companies?.length === 0
					?
					<p className='text-slate-500 text-center'>Belum ada perusahaan.</p>
					:
					<ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
						{
							companies?.map((company: any) => {
								return (
									<li key={company.slug}>
										<button onClick={() => handleChangeCompany(company.id)} className={`${company.id === activeCompany.id ? 'bg-blue-100 border-blue-200' : 'bg-white border-slate-200'} w-full group flex items-center justify-between p-4 border hover:bg-slate-50 hover:border-slate-300 rounded-xl shadow-sm transition-all text-left cursor-pointer`}>
											<div className="flex items-center gap-3.5">
												{/* Icon Container */}
												<div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
													<Building2 size={20} strokeWidth={1.75} />
												</div>
												{/* Text Info */}
												<div>
													<span className="block font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
														{company.name}
													</span>
													<span className="text-xs text-slate-500 tracking-wide uppercase">
														{company.role}
													</span>
												</div>
											</div>
										</button>
									</li>
								)
							}
							)
						}
					</ul>
				)
			}
      
    </div>
  )
}

export default UserDashboard