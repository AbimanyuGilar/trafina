'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { requireRoles } from "@/lib/auth-guard";
import { getFullOrganization } from "@/lib/organizations";

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

export async function addCategory(newCategory: {name: string, type: string}) {
  const organization = await getFullOrganization()
  const categoryToAdd = {
    ...newCategory,
    organizationId: organization?.id
  }
  console.log(categoryToAdd)
}