import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Metadata } from "next"

export const metadata: Metadata = {
	title: 'Admin Dashboard'
}

const page = async () => {
	const session = await auth.api.getSession({
		headers: await headers()
	})

  return (
		<>
			<h1>Dashboard Admin</h1>
		</>
  )
}

export default page
