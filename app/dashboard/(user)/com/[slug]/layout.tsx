import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import React from "react"

const layout = async ({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }>}) => {
  const { slug } = await params

  const organizations = await auth.api.listOrganizations({
    headers: await headers()
  });

  if (!organizations) redirect('/dashboard')

  const currentOrg = organizations?.find((org) => org.slug === slug)

  if (!currentOrg) {
    redirect('/dashboard')
  }

 	return (
    <>
      {children}
    </>
  )
}

export default layout