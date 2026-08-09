import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireRoles(requiredRoles: string[]) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect('/login')

  const userRole = session?.user?.role

  if (!userRole || !requiredRoles.includes(userRole)) {
    redirect('/dashboard')
  }

  return session
}