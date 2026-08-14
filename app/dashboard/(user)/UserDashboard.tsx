import { getFullOrganization } from '@/lib/organizations'
import { redirect } from 'next/navigation'

const UserDashboard = async () => {
	const activeCompany = await getFullOrganization()

	if (!activeCompany) redirect('dashboard/com')

	console.log(activeCompany)

  return (
    <div className="w-full space-y-6">
			Dashboard User
    </div>
  )
}

export default UserDashboard