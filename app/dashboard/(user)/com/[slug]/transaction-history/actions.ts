"use server"

import prisma from "@/lib/prisma"
import { getFullOrganization } from "@/lib/organizations"

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
    
    console.log("TRANSACTIONS DARI PRISMA:", transactions)

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.transactionType,
      category: transaction.transactionCategory,
      total: Number(transaction.totalPrice),
      paymentMethod: transaction.paymentMethod,
      detail: transaction.detail,
      date: transaction.createdAt.toISOString(),
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