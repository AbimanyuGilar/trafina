import React from 'react'
import { requirePermission } from '@/lib/auth-guard'

const ManualTransactionPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  await requirePermission('manage_manual_transaction', slug)

  return (
    <div>ManualTransactionPage</div>
  )
}

export default ManualTransactionPage