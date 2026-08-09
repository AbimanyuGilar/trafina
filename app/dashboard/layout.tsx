import Sidebar from "./sidebar";
import React from "react";
import { requireRoles } from "@/lib/auth-guard";

export default async function DashboardPage({ children }: { children: React.ReactNode }) {
  const session = await requireRoles(['ADMIN', 'OWNER', 'STAFF'])

  return (
    <Sidebar user={session.user}>
      { children }
    </Sidebar>
  );
}