import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Dashboard'
}

const StaffDashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return (
    <>
      <h1>Dashboard Staff</h1>
    </>
  )
}

export default StaffDashboard
