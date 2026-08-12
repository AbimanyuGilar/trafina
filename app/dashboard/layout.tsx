import React from "react";
import { requireRoles } from "@/lib/auth-guard";
import DashboardWrapper from "./DashboardWrapper";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoles(['ADMIN', 'USER',])

  // Fetch member permissions
  let permissions: string[] = []
  let isOwner = false

  if (session.session.activeOrganizationId) {
    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: session.session.activeOrganizationId,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })
    
    if (member) {
      permissions = member.permissions.map(p => p.permission.name)
      isOwner = member.role === 'owner'
    }
  }

  return (
    <>
      <DashboardWrapper user={session.user} permissions={permissions} isOwner={isOwner}>
        { children }
      </DashboardWrapper>
    </>
  );
}