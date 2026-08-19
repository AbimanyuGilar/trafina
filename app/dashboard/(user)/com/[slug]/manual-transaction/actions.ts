'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { requireOrganization, requireRoles } from "@/lib/auth-guard";
import { getFullOrganization } from "@/lib/organizations";
import { Transaction, TransactionType } from "@/generated/prisma/client";
import { organization } from "better-auth/plugins";
import { supabaseAdmin } from "@/lib/supabase";

export async function getCategories() {
  await requireRoles(['USER'])
  const organization = await getFullOrganization()

  const categories = await prisma.transactionCategory.findMany({
    where: {
      organizationId: organization?.id
    }
  })

  return categories
}

export async function addCategory(newCategory: {name: string, type: TransactionType}) {
  const organization = await getFullOrganization()
  if (!organization?.id) {
    throw new Error("Organization not found.")
  }
  const { name, type } = newCategory
  try {
    return await prisma.transactionCategory.create({
      data: {
        name,
        type,
        organizationId: organization.id
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Pesan error:", error.message)
    } else {
      console.error("Terjadi error tak dikenal:", error)
    }
    return null
  }
}

export async function deleteCategory(category: any) {
  if (category.name === 'Kasir') throw new Error("Can not delete default category.")

  const organization = await getFullOrganization()

  if (!organization?.id) {
    throw new Error("Organization not found.")
  }

  try {
    await prisma.transactionCategory.delete({
      where: {
        id: category.id,
        organizationId: organization.id
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Pesan error:", error.message)
    } else {
      console.error("Terjadi error tak dikenal:", error)
    }
  }
}

type TransactionFilterType = {
  page: number,
  pageSize: number,
  type?: TransactionType,
  search?: string
}

export async function getTransactions({
  page,
  pageSize,
  type,
  search
}: TransactionFilterType = {
  page: 1,
  pageSize: 5
}) {
  const org = await getFullOrganization()
  if (!org) {
    return {
      success: false,
      message: 'Gagal memuat transaksi.'
    }
  }

  const skip = (page - 1 ) * pageSize

  try {
    const transactions = await prisma.transaction.findMany({
      skip,
      take: pageSize,
      where: {
        organizationId: org?.id,

        ...(type && {
          transactionType: type
        }),

        ...(search && {
          OR: [
            { detail: { contains: search, mode: 'insensitive' } },
            { paymentMethod: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      data: transactions
    }

  } catch {
    return {
      success: false,
      message: 'Gagal memuat transaksi.'
    }
  }
}

export async function addTransaction(formData: FormData) {
  const org = await getFullOrganization()

  if (!org) {
    return {
      success: false,
      message: 'Gagal membuat transaksi.'
    }
  }
  
  const receiptFile = formData.get('receipt') as File

  let filePath: string | null = null

  if (receiptFile) {
    const fileExtension = receiptFile.name.split('.').pop()
    const randomFileName = `${crypto.randomUUID()}.${fileExtension}`
    
    filePath = `transaction_receipt/${org.id}/${randomFileName}`

    const receiptArrayBuffer = await receiptFile.arrayBuffer()
    const receiptBuffer = Buffer.from(receiptArrayBuffer)

    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('image')
      .upload(filePath, receiptBuffer, {
        contentType: receiptFile.type,
        upsert: false,
      })

    if (storageError) return {
      success: false,
      message: 'Gagal membuat transaksi.'
    }
  }

  try {
    const newTransaction = {
      totalPrice: Number(formData.get('totalPrice')) as number,
      detail: formData.get('detail') as string,
      paymentMethod: formData.get('paymentMethod') as string,
      transactionType: formData.get('transactionType') as TransactionType,
      organizationId: org.id as string,
      transactionCategory: formData.get('transactionCategory') as string,
      receipt: filePath
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...newTransaction,
        organizationId: org?.id
      }
    })

    return {
      success: true,
      data: transaction
    }
  } catch {
    return {
      success: false,
      message: 'Gagal membuat transaksi.'
    }
  }
}

export async function deleteTransaction(transaction: Omit<Transaction, 'createdAt' | 'updatedAt'>) {
  const org = await getFullOrganization()

  if (!org) {
    return {
      success: false,
      message: 'Gagal membatalkan transaksi.'
    }
  }

  try {
    const deleted = await prisma.transaction.delete({
      where: {
        id: transaction.id,
        organizationId: org?.id
      }
    })

    return {
      success: true,
      data: deleted
    }
  } catch {
    return {
      success: false,
      message: 'Gagal menambah membuat transaksi.'
    }
  }
}

export async function getReceiptSignedUrl(filePath: string) {
  if (!filePath) {
    return { success: false, message: 'File path tidak valid' }
  }

  const org = await requireOrganization()

  const orgFile = filePath.split('/')[1]

  if (org.id !== orgFile) return { success: false, message: 'Gagal mengambil URL file' }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('image').createSignedUrl(filePath, 60)

    if (error) {
      console.error('Error Signed URL:', error.message)
      return { success: false, message: 'Gagal mengambil URL file' }
    }

    return {
      success: true,
      url: data.signedUrl,
    }
  } catch (err) {
    return { success: false, message: 'Terjadi kesalahan pada server' }
  }
}