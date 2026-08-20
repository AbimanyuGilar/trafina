import { requirePermission } from '@/lib/auth-guard'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import TransactionMethodList from './TransactionMethodList'

const TransactionMethodPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params

  const { session } = await requirePermission('manage_transaction_method', slug)

  const companyData = await auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationSlug: slug },
  })

  if (!companyData) {
    redirect('/dashboard')
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Metode Transaksi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola metode pembayaran yang tersedia untuk transaksi di {companyData.name}
          </p>
        </div>
      </div>

      <TransactionMethodList />
    </div>
  )
}

export default TransactionMethodPage