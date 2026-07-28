import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Metadata } from "next"

export const metadata: Metadata = {
	title: 'Dashboard'
}

const page = async () => {
	const session = await auth.api.getSession({
		headers: await headers()
	})

	if (!session) {
		redirect('/login')
	}

	if (session?.user.role !== 'USER') {
		redirect('/')
	}

  return (
		<>
			<h1>Dashboard User</h1>
		</>
  )
}

export default page
