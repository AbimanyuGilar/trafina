import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "./dashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/login')
  }

  if (session?.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <>
      <DashboardShell user={session.user}>
        {children}
      </DashboardShell>
    </>
  );
}