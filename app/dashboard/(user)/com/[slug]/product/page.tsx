import React from 'react'
import { requirePermission } from '@/lib/auth-guard'

const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  await requirePermission('manage_products', slug)

  return (
    <div>ProductPage</div>
  )
}

export default ProductPage