import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

export async function requireRoles(requiredRoles: string[]) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect('/login')

  const userRole = session?.user?.role

  if (!userRole || !requiredRoles.includes(userRole)) {
    notFound()
  }

  return session
}

export async function requirePermission(permissionName: string, organizationSlug: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect('/login')

  // Dapatkan member berdasarkan userId dan organizationSlug
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: organizationSlug,
      },
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  if (!member) {
    notFound()
  }

  // Jika owner, langsung izinkan (Akses Penuh)
  if (member.role === 'owner') {
    return { session, member }
  }

  // Jika bukan owner, periksa apakah memiliki permissionName
  const hasPermission = member.permissions.some(p => p.permission.name === permissionName)
  if (!hasPermission) {
    notFound()
  }

  return { session, member }
}