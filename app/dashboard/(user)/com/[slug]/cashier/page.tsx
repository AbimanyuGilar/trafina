import React from 'react'
import { requirePermission } from '@/lib/auth-guard'

const CashierPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  await requirePermission('manage_cashier', slug)

  return (
    <div>CashierPage</div>
  )
}

export default CashierPage