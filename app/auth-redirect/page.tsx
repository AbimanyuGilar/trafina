import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const routes = [
  {
    role: 'ADMIN',
    redirect: '/admin'
  },
  {
    role: 'USER',
    redirect: '/owner'
  }
]

const authRedirect = async () => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect('/login')

  const role = session?.user.role

  const matchedRoute = routes.find(route => route.role === role)

  if (matchedRoute) {
    redirect(matchedRoute.redirect)
  }

  redirect('/')
}


export default authRedirect 