'use server'

import prisma from "@/lib/prisma"
import { requireRoles } from "@/lib/auth-guard"

export async function addProduct(orgId: string, data: {
  name: string
  category: string
  buyPrice: number
  price: number
  unit: string
  stock: number
}) {
  await requireRoles(['USER'])

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find or create category
      let categoryObj = await tx.productCategory.findFirst({
        where: {
          name: { equals: data.category.trim(), mode: 'insensitive' },
          organizationId: orgId
        }
      })

      if (!categoryObj) {
        categoryObj = await tx.productCategory.create({
          data: {
            name: data.category.trim(),
            organizationId: orgId
          }
        })
      }

      // Create product
      const product = await tx.product.create({
        data: {
          name: data.name,
          buyPrice: data.buyPrice,
          price: data.price,
          unit: data.unit,
          stock: data.stock,
          organizationId: orgId
        }
      })

      // Link product and category
      await tx.productHasCategory.create({
        data: {
          productId: product.id,
          categoryId: categoryObj.id
        }
      })

      return product
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, message: "Gagal menambahkan produk." }
  }
}

export async function editProduct(orgId: string, productId: string, data: {
  name: string
  category: string
  buyPrice: number
  price: number
  unit: string
  stock: number
}) {
  await requireRoles(['USER'])

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find or create category
      let categoryObj = await tx.productCategory.findFirst({
        where: {
          name: { equals: data.category.trim(), mode: 'insensitive' },
          organizationId: orgId
        }
      })

      if (!categoryObj) {
        categoryObj = await tx.productCategory.create({
          data: {
            name: data.category.trim(),
            organizationId: orgId
          }
        })
      }

      // Update product details
      const product = await tx.product.update({
        where: { id: productId, organizationId: orgId },
        data: {
          name: data.name,
          buyPrice: data.buyPrice,
          price: data.price,
          unit: data.unit,
          stock: data.stock
        }
      })

      // Delete existing categories linkages
      await tx.productHasCategory.deleteMany({
        where: { productId }
      })

      // Create new category linkage
      await tx.productHasCategory.create({
        data: {
          productId,
          categoryId: categoryObj.id
        }
      })

      return product
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error editing product:", error)
    return { success: false, message: "Gagal mengubah produk." }
  }
}

export async function deleteProduct(orgId: string, productId: string) {
  await requireRoles(['USER'])

  try {
    const product = await prisma.product.delete({
      where: { id: productId, organizationId: orgId }
    })

    return { success: true, data: product }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, message: "Gagal menghapus produk." }
  }
}
