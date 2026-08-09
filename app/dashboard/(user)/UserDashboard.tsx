'use client'
import { authClient } from "@/lib/auth-client"
import { redirect } from "next/navigation"

const UserDashboard = () => {
	const { data: activeOrganization, isPending } = authClient.useActiveOrganization()
  if (isPending) return <p> Loading... </p>
	return <p> Organisasi aktif: { activeOrganization?.name ?? 'Tidak ada' } </p>
}

export default UserDashboard
