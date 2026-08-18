'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { requireRoles } from "@/lib/auth-guard";
import { getFullOrganization } from "@/lib/organizations";
import { TransactionType } from "@/generated/prisma/client";

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