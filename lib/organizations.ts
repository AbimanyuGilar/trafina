import { auth } from "./auth";
import { headers } from "next/headers";
import { requireRoles } from "./auth-guard";

export const getFullOrganization = async ({ organizationId, organizationSlug }: { organizationId?: string, organizationSlug?: string } = {}) => {
  const session = await requireRoles(['USER'])
  
  const query: { organizationId?: string; organizationSlug?: string } = {};
  if (organizationId) query.organizationId = organizationId;
  if (organizationSlug) query.organizationSlug = organizationSlug;

  const org = await auth.api.getFullOrganization({
    headers: await headers(),
    ...(Object.keys(query).length > 0 && { query })
  });

  if (!org) {
    return null;
  }

  const metadata = typeof org?.metadata === 'string'
  ? (() => {
      try {
        return JSON.parse(org.metadata)
      } catch {
        return {}
      }
    })()
  : (org?.metadata || {})

  const formattedOrg = {
    ...org,
    role: org?.members.find(data => data.userId === session.user.id)?.role,
    metadata
  }

  return formattedOrg
}

export const getListOrganization = async () => {
  const data = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return data
}