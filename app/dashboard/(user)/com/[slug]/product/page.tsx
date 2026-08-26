import React from 'react'
import { requirePermission } from '@/lib/auth-guard'
import ProductPageClient from './ProductPageClient'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getFullOrganization } from '@/lib/organizations'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const companyData = await getFullOrganization()

  if (!companyData || companyData.slug !== slug) {
    return {
      title: 'Trafinaaaaaaa',
    }
  }

  return {
    title: companyData.name + ' - Produk',
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requirePermission('manage_products', slug)

  // Fetch company
  const org = await prisma.organization.findUnique({
    where: { slug }
  })
  if (!org) redirect('/dashboard')

  // Fetch products (with categories)
  const products = await prisma.product.findMany({
    where: { organizationId: org.id },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch product categories
  const categories = await prisma.productCategory.findMany({
    where: { organizationId: org.id }
  })

  // Serialize dates
  const serializedProducts = products.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    categories: p.categories.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      category: {
        ...c.category,
        createdAt: c.category.createdAt.toISOString(),
        updatedAt: c.category.updatedAt.toISOString()
      }
    }))
  }))

  const serializedCategories = categories.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString()
  }))

  return (
    <ProductPageClient 
      orgId={org.id}
      initialProducts={serializedProducts}
      categories={serializedCategories}
    />
  )
}