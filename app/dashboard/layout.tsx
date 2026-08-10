import React from "react";
import { requireRoles } from "@/lib/auth-guard";
import DashboardWrapper from "./DashboardWrapper";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoles(['ADMIN', 'USER',])

  return (
    <>
      <DashboardWrapper user={session.user}>
        { children }
      </DashboardWrapper>
    </>
  );
}