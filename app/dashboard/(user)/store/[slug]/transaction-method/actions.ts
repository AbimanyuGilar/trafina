'use server'

import prisma from "@/lib/prisma"
import { requireOrganization } from "@/lib/auth-guard"

interface TransactionMethodsFilterType {
  page: number
  pageSize: number
  search?: string
}
export async function getTransactionMethods({ pageSize, page, search }: TransactionMethodsFilterType = {
  pageSize: 5, page: 1
}) {
  const org = await requireOrganization()

  try {
    const data = await prisma.paymentMethod.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        organizationId: org.id,
        ...(search && {
          name: { contains: search, mode: 'insensitive' }
        }),
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      data
    }
  } catch {
    return {
      success: false,
      message: 'Gagal memuat metode transaksi.'
    }
  }
}

export async function getMethodsCount() {
  const org = await requireOrganization()

  try {
    const data = await prisma.paymentMethod.count({
      where: {
        organizationId: org.id
      }
    })

    return {
      success: true,
      data
    }
  } catch {
    return {
      success: false,
      message: 'Gagal memuat total metode transaksi.'
    }
  }
}

export async function addTransactionMethod(newMethod: string) {
  if (newMethod.toLowerCase() === 'tunai' || newMethod.toLowerCase() === 'qris') {
    return {
      success: false,
      message: "Tidak bisa menambah metode default."
    }
  }

  const org = await requireOrganization()

  try {
    const data = await prisma.paymentMethod.create({
      data: {
        name: newMethod,
        organizationId: org.id
      }
    })

    return {
      success: true,
      data
    }
  } catch {
    return {
      success: false,
      message: "Gagal menambah metode transaksi"
    }
  }
}

export async function deleteTransactionMethod(method: any) {
  if (method.name.toLowerCase() === 'tunai' || method.name.toLowerCase() === 'qris') {
    return {
      success: false,
      message: "Tidak bisa menghapus metode default."
    }
  }
  
  const org = await requireOrganization()
  
  try {
    const deleted = await prisma.paymentMethod.delete({
      where: {
        id: method.id
      }
    })

    return {
      success: true,
      data: deleted
    }
  } catch (e) {
    return {
      success: false,
      message: 'Gagal menghapus metode transaksi.'
    }
  }
}

export async function updateTransactionMethod({ newName, methodId }: { newName: any, methodId: string }) {
  if (newName.toLowerCase() === 'tunai' || newName.toLowerCase() === 'qris') {
    return {
      success: false,
      message: "Tidak bisa menghapus metode default."
    }
  }

  await requireOrganization()

  try {
    const updated = await prisma.paymentMethod.update({
      where: {
        id: methodId
      },
      data: {
        name: newName
      }
    })

    return {
      success: true,
      data: updated
    }
  } catch {
    return {
      success: false,
      message: 'Gagal mengedit metode transaksi '
    }
  }
}