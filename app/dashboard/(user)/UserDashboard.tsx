'use client'
import { authClient } from "@/lib/auth-client"
import { redirect } from "next/navigation"

const UserDashboard = () => {
	const { data: activeOrganization, isPending } = authClient.useActiveOrganization()
  if (isPending) return <p> Loading... </p>
	if (!activeOrganization) redirect('/organization')
	return <p> Organisasi aktif: { activeOrganization.name } </p>
}

export default UserDashboard
