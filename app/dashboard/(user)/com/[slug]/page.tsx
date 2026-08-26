import { requireRoles } from '@/lib/auth-guard'
import CompanyDetail from './companyDetail'
import { getFullOrganization } from '@/lib/organizations'
import { redirect } from "next/navigation"
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const companyData = await getFullOrganization()

  if (!companyData || companyData.slug !== slug) {
    return {
      title: 'Trafinaaaaaaa',
    }
  }

  return {
    title: companyData.name,
  }
}


export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const session = await requireRoles(["USER"])
  
  const companyData = await getFullOrganization()
  if (!companyData) redirect('/dashboard')

  if (companyData.slug !== slug) redirect('/dashboard')
  
  return (
    <>
      <CompanyDetail companyData={companyData}/>
    </>
  )
}