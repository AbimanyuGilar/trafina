'use server'

import { requireOrganization } from "@/lib/auth-guard"
import prisma from "@/lib/prisma"

interface Product {
  id: string
  name: string
  price: number
  amount: number
}

export async function createTransaction({ products, paymentMethod }: { products: Product[], paymentMethod: string }) {
  const org = await requireOrganization()
  const totalPrice = products.reduce((accumulator, product) => product.price + accumulator, 0)

  try {
    const resultTransaction = await prisma.$transaction(async (tx) => {

      const transaction = await tx.transaction.create({
        data: {
          detail: JSON.stringify(products),
          paymentMethod,
          totalPrice,
          transactionCategory: 'Kasir',
          transactionType: 'INCOME',
          organizationId: org.id
        }
      })
  
      for (const product of products) {
        const dbProduct = await tx.product.findUnique({
          where: { id: product.id },
          select: { trackStock: true }
        });

        if (!dbProduct?.trackStock) continue;

        const result = await tx.product.updateMany({
          where: {
            id: product.id,
            stock: {
              gte: product.amount
            }
          },
          data: {
            stock: {
              decrement: product.amount
            }
          }
        });
  
        if (result.count === 0) {
          throw new Error("Gagal: Stok tidak mencukupi!");
        }
      }

      return transaction
    })

    return {
      success: true,
      data: resultTransaction
    }

  } catch {
    return {
      success: false,
      message: 'Gagal membuat transaksi.'
    }
  }
}