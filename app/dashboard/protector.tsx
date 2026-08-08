import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const Protector = async ({ children, permittedRoles }: { children: React.ReactNode, permittedRoles?: string[] }) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || !permittedRoles?.includes(session.user.role)) {
    return <></>
  }

  return (
    <>{children}</>
  )
}

export default Protector