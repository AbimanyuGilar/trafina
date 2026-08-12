import React from 'react'
import { requirePermission } from '@/lib/auth-guard'

const TransactionHistoryPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  await requirePermission('manage_transaction_history', slug)

  return (
    <div>TransactionHistoryPage</div>
  )
}

export default TransactionHistoryPage