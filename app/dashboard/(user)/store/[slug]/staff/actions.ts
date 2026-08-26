'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function updateMemberPermissions(memberId: string, permissionNames: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("Unauthorized")
  }

  // 1. Dapatkan data member yang mau diupdate untuk memastikan valid
  const memberToUpdate = await prisma.member.findUnique({
    where: { id: memberId },
  })

  if (!memberToUpdate) {
    throw new Error("Member tidak ditemukan")
  }

  // 2. Cek apakah user yang login punya wewenang (owner/admin di org yang sama)
  const currentUserMember = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: memberToUpdate.organizationId,
    },
  })

  if (!currentUserMember || (currentUserMember.role !== "owner" && currentUserMember.role !== "admin")) {
    throw new Error("Forbidden: Hanya owner atau admin yang dapat memperbarui izin")
  }

  // 3. Update permissions menggunakan transaction / step-by-step
  // Cari atau buat permission record untuk masing-masing name
  const permissionIds = await Promise.all(
    permissionNames.map(async (name) => {
      const perm = await prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      })
      return perm.id
    })
  )

  // Hapus semua permission lama untuk member ini
  await prisma.memberPermission.deleteMany({
    where: {
      memberId: memberId,
    },
  })

  // Tambahkan permission baru
  if (permissionIds.length > 0) {
    await prisma.memberPermission.createMany({
      data: permissionIds.map((permId) => ({
        memberId: memberId,
        permissionId: permId,
      })),
    })
  }

  return { success: true }
}
