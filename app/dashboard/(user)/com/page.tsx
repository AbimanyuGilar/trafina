import CompanyPage from "./companyPage";
import { getFullOrganization, getListOrganization } from "@/lib/organizations";
import { requireRoles } from "@/lib/auth-guard";

const page = async () => {
  const session = await requireRoles(['USER'])
  const {role: userRole, id: userId} = session.user
  const companies = userRole === 'USER' ? await getListOrganization() : null
  
    const companiesWithRole = companies ? await Promise.all(
      companies?.map(async (com) => {
        const companyData = await getFullOrganization({ organizationId: com.id })
        const member = companyData?.members?.find(data => data.userId === userId)
        
        return {
          ...com,
          role: member?.role
        }
      })
    ): companies
  
    const activeCompany = await getFullOrganization()

  return (
    <CompanyPage companies={companiesWithRole} activeCompany={activeCompany} />
  )
}

export default page