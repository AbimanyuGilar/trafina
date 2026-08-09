import { requireRoles } from "@/lib/auth-guard"
import AdminDashboard from "./(admin)/AdminDashboard"
import OwnerDashboard from "./(owner)/OwnerDashboard"
import StaffDashboard from "./(staff)/StaffDashboard"

const Dashboard = async () => {
  const session = await requireRoles(['ADMIN', 'OWNER', 'STAFF'])

  return (
    <>
      { session.user.role === 'ADMIN' && <AdminDashboard /> }
      { session.user.role === 'OWNER' && <OwnerDashboard /> }
      { session.user.role === 'STAFF' && <StaffDashboard /> }
    </>
  )
}

export default Dashboard