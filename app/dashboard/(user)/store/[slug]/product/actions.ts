'use server'

import prisma from "@/lib/prisma"
import { requireRoles } from "@/lib/auth-guard"
import { getFullOrganization } from "@/lib/organizations"
import { supabaseAdmin } from "@/lib/supabase"

export async function addCategory(name: string, orgId?: string) {
  await requireRoles(['USER'])
  let organizationId = orgId
  if (!organizationId) {
    const organization = await getFullOrganization()
    organizationId = organization?.id
  }
  if (!organizationId) {
    return { success: false, message: "Organisasi tidak ditemukan." }
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { success: false, message: "Nama kategori harus diisi." }
  }

  try {
    const existing = await prisma.productCategory.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
        organizationId
      }
    })

    if (existing) {
      return { success: false, message: "Kategori dengan nama ini sudah ada." }
    }

    const category = await prisma.productCategory.create({
      data: {
        name: trimmedName,
        organizationId
      }
    })
    return { success: true, data: category }
  } catch (error) {
    console.error("Error adding product category:", error)
    return { success: false, message: "Gagal menambahkan kategori." }
  }
}

export async function deleteCategory(id: string, orgId?: string) {
  await requireRoles(['USER'])
  let organizationId = orgId
  if (!organizationId) {
    const organization = await getFullOrganization()
    organizationId = organization?.id
  }
  if (!organizationId) {
    return { success: false, message: "Organisasi tidak ditemukan." }
  }

  try {
    await prisma.productCategory.delete({
      where: {
        id,
        organizationId
      }
    })
    return { success: true }
  } catch (error) {
    console.error("Error deleting product category:", error)
    return { success: false, message: "Gagal menghapus kategori." }
  }
}

export async function addProduct(orgId: string, formData: FormData) {
  await requireRoles(['USER'])

  const imageFile = formData.get('image') as File | null

  let filePath: string | null = null

  if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
    const fileExtension = imageFile.name.split('.').pop()
    const randomFileName = `${crypto.randomUUID()}.${fileExtension}`
    
    filePath = `products/${orgId}/${randomFileName}`

    const imageArrayBuffer = await imageFile.arrayBuffer()
    const imageBuffer = Buffer.from(imageArrayBuffer)

    const { error: storageError } = await supabaseAdmin.storage
      .from('public_image')
      .upload(filePath, imageBuffer, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (storageError) {
      console.error("Storage upload error:", storageError)
      return {
        success: false,
        message: 'Gagal mengupload gambar produk.'
      }
    }
  }

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const price = Number(formData.get('price')) || 0
  const trackStock = formData.get('trackStock') === 'true'
  const unit = trackStock ? ((formData.get('unit') as string) || 'pcs') : null
  const stock = Number(formData.get('stock')) || 0

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find or create category
      let categoryObj = await tx.productCategory.findFirst({
        where: {
          name: { equals: category.trim(), mode: 'insensitive' },
          organizationId: orgId
        }
      })

      if (!categoryObj) {
        categoryObj = await tx.productCategory.create({
          data: {
            name: category.trim(),
            organizationId: orgId
          }
        })
      }

      // Create product
      const product = await tx.product.create({
        data: {
          name: name.trim(),
          price,
          unit,
          stock: trackStock ? stock : 0,
          trackStock,
          image: filePath,
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

export async function editProduct(orgId: string, productId: string, formData: FormData) {
  await requireRoles(['USER'])

  const imageFile = formData.get('image') as File | null
  const removeImage = formData.get('removeImage') === 'true'

  let filePath: string | null = null

  if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
    const fileExtension = imageFile.name.split('.').pop()
    const randomFileName = `${crypto.randomUUID()}.${fileExtension}`
    
    filePath = `products/${orgId}/${randomFileName}`

    const imageArrayBuffer = await imageFile.arrayBuffer()
    const imageBuffer = Buffer.from(imageArrayBuffer)

    const { error: storageError } = await supabaseAdmin.storage
      .from('public_image')
      .upload(filePath, imageBuffer, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (storageError) {
      console.error("Storage upload error:", storageError)
      return {
        success: false,
        message: 'Gagal mengupload gambar produk.'
      }
    }
  }

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const price = Number(formData.get('price')) || 0
  const trackStock = formData.get('trackStock') === 'true'
  const unit = trackStock ? ((formData.get('unit') as string) || 'pcs') : null
  const stock = Number(formData.get('stock')) || 0

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId, organizationId: orgId }
    })

    const result = await prisma.$transaction(async (tx) => {
      // Find or create category
      let categoryObj = await tx.productCategory.findFirst({
        where: {
          name: { equals: category.trim(), mode: 'insensitive' },
          organizationId: orgId
        }
      })

      if (!categoryObj) {
        categoryObj = await tx.productCategory.create({
          data: {
            name: category.trim(),
            organizationId: orgId
          }
        })
      }

      const updateData: {
        name: string
        price: number
        unit: string | null
        stock: number
        trackStock: boolean
        image?: string | null
      } = {
        name: name.trim(),
        price,
        unit,
        stock: trackStock ? stock : 0,
        trackStock
      }

      if (filePath) {
        updateData.image = filePath
      } else if (removeImage) {
        updateData.image = null
      }

      // Update product details
      const product = await tx.product.update({
        where: { id: productId, organizationId: orgId },
        data: updateData
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

    // If new image was uploaded or image was removed, delete old image from storage
    if (existingProduct?.image && (filePath || removeImage)) {
      try {
        await supabaseAdmin.storage
          .from('public_image')
          .remove([existingProduct.image])
      } catch (err) {
        console.error("Error removing old image from storage:", err)
      }
    }

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

    if (product.image) {
      try {
        await supabaseAdmin.storage
          .from('public_image')
          .remove([product.image])
      } catch (err) {
        console.error("Error removing old image from storage:", err)
      }
    }

    return { success: true, data: product }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, message: "Gagal menghapus produk." }
  }
}
