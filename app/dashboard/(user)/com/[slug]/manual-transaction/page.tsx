import { requirePermission } from '@/lib/auth-guard'
import ManualTransaction from './ManualTransaction'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getCategories } from './actions'
import prisma from '@/lib/prisma'

const ManualTransactionPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  await requirePermission('manage_manual_transaction', slug)

  const session = await auth.api.getSession({
    headers: await headers()
  })

  const org = await auth.api.getFullOrganization({
    headers: await headers()
  })

  const categories = await prisma.transactionCategory.findMany({
    where: {
      organizationId: org?.id,
      name: {
        not: 'Kasir'
      }
    }
  })

  const initialTransactions = await prisma.transaction.findMany({
    where: {
      organizationId: org?.id,
      transactionCategory: {
        not: 'Kasir'
      }
    }
  })

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: {
      organizationId: org?.id,
    }
  })

  return (
    <>
      <ManualTransaction user={session?.user} paymentMethods={paymentMethods} initialTransactionCategories={categories} initialTransactions={initialTransactions} organizationName={org?.name}/>
    </>
  )
}

export default ManualTransactionPage