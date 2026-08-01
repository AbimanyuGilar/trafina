import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "./dashboardShell";
import OwnerPage from "./owner/OwnerPage";
import AdminPage from "./admin/AdminPage";
import StaffPage from "./staff/StaffPage";

export default async function DashboardLayout() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/login')
  }

  const permittedRoles = [
    'ADMIN',
    'OWNER',
    'STAFF'
  ]

  const userRole = session?.user?.role

  if (!permittedRoles.includes(userRole)) {
    redirect('/')
  }

  return (
    <>
      <DashboardShell user={session.user}>
        { userRole === 'OWNER' && <OwnerPage/> }
        { userRole === 'ADMIN' && <AdminPage/> }
        { userRole === 'STAFF' && <StaffPage/> }
      </DashboardShell>
    </>
  );
}