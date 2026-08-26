'use server'

import prisma from "@/lib/prisma"
import { getFullOrganization } from "@/lib/organizations"
import { TransactionType } from "@/generated/prisma/client"

export async function addTransactionDashboard(data: {
  totalPrice: number
  detail: string
  transactionType: TransactionType
  paymentMethod: string
  transactionCategory: string
}) {
  const org = await getFullOrganization()
  if (!org) {
    return {
      success: false,
      message: 'Gagal membuat transaksi: Toko aktif tidak ditemukan.'
    }
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        totalPrice: data.totalPrice,
        detail: data.detail,
        transactionType: data.transactionType,
        paymentMethod: data.paymentMethod,
        transactionCategory: data.transactionCategory,
        organizationId: org.id,
      }
    })

    return {
      success: true,
      data: transaction
    }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return {
      success: false,
      message: 'Gagal menyimpan transaksi ke database.'
    }
  }
}
