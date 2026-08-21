import React from 'react'
import { requirePermission } from '@/lib/auth-guard'
import { getFullOrganization } from '@/lib/organizations'
import prisma from '@/lib/prisma'
import CashierPage from './CashierPage'

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  await requirePermission('manage_cashier', slug)

  const org = await getFullOrganization()

  const products = await prisma.product.findMany({
    where: {
      organizationId: org?.id
    },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })

  const categories = await prisma.productCategory.findMany({
    where: {
      organizationId: org?.id
    },
  })

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: {
      organizationId: org?.id
    }
  })
  
  const data = products.map(item => ({
    ...item,
    categories: item.categories.map((pivot) => pivot.category),
  }))

  return (
    <CashierPage products={data} categories={categories} paymentMethods={paymentMethods} />
  )
}

export default page