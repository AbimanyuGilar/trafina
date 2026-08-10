import React from "react";
import { requireRoles } from "@/lib/auth-guard";
import DashboardSidebar from "./DashboardSidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoles(['ADMIN', 'USER',])

  const organization = await auth.api.getFullOrganization({
    headers: await headers()
  });

  if(!organization) redirect('/organization')

  return (
    <>
      <DashboardSidebar user={session.user}>
        { children }
      </DashboardSidebar>
    </>
  );
}