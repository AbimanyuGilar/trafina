"use server"

import prisma from "@/lib/prisma"
import { getFullOrganization } from "@/lib/organizations"
import { requireOrganization } from "@/lib/auth-guard"
import { supabaseAdmin } from "@/lib/supabase"

export async function getTransactions() {
  const org = await getFullOrganization()

  if (!org) {
    return {
      success: false,
      message: "Gagal memuat transaksi.",
      data: [],
    }
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: org.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.transactionType,
      category: transaction.transactionCategory,
      total: Number(transaction.totalPrice),
      paymentMethod: transaction.paymentMethod,
      detail: transaction.detail,
      date: transaction.createdAt.toISOString(),
      receipt: transaction.receipt,
    }))

    return {
      success: true,
      data: formattedTransactions,
    }
  } catch (error) {
    console.error("Gagal mengambil transaksi:", error)

    return {
      success: false,
      message: "Gagal memuat transaksi.",
      data: [],
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