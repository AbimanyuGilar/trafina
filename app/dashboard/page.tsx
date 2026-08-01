import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import DashboardShell from "./dashboardShell";

// Lazy load komponen halaman
const OwnerPage = dynamic(() => import("./owner/OwnerPage"));
const AdminPage = dynamic(() => import("./admin/AdminPage"));
const StaffPage = dynamic(() => import("./staff/StaffPage"));

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/login');
  }

  const userRole = session?.user?.role;
  const permittedRoles = ['ADMIN', 'OWNER', 'STAFF'];

  if (!userRole || !permittedRoles.includes(userRole)) {
    redirect('/');
  }

  return (
    <DashboardShell user={session.user}>
      {userRole === 'OWNER' && <OwnerPage />}
      {userRole === 'ADMIN' && <AdminPage />}
      {userRole === 'STAFF' && <StaffPage />}
    </DashboardShell>
  );
}