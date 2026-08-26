'use server'

import prisma from "@/lib/prisma"
import { requireRoles, checkOrganization } from "@/lib/auth-guard"

export async function createInitialData(orgData: any) {
  await requireRoles(['USER'])

  await checkOrganization(orgData.id)

  const inputData = [
    { name: 'Tunai', organizationId: orgData.id },
    { name: 'QRIS', organizationId: orgData.id },
  ]

  const existingMethods = await prisma.paymentMethod.findMany({
    where: {
      organizationId: orgData.id,
      name: { in: inputData.map((item) => item.name) },
    },
    select: { name: true },
  })

  const existingNames = new Set(existingMethods.map((m) => m.name))

  const newItems = inputData.filter((item) => !existingNames.has(item.name))

  if (newItems.length > 0) {
    await prisma.paymentMethod.createMany({
      data: newItems,
    })
  }

  const existingCategory = await prisma.transactionCategory.findFirst({
    where: {
      organizationId: orgData.id,
      name: "Kasir",
    },
  })

  if (!existingCategory) {
    await prisma.transactionCategory.create({
      data: {
        name: "Kasir",
        organizationId: orgData.id,
        type: 'INCOME',
      },
    })
  }
}