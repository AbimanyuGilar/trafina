import { requireRoles } from '@/lib/auth-guard'

const Staff = async () => {
  const session = await requireRoles(["OWNER"])
  return (
    <div>Manage Staff</div>
  )
}

export default Staff