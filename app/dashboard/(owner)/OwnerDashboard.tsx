import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Metadata } from "next"

export const metadata: Metadata = {
	title: 'Dashboard'
}

const OwnerDashboard = async () => {
  return (
		<>
			<h1>Dashboard Owner</h1>
		</>
  )
}

export default OwnerDashboard
