'use server'

import { getFullOrganization } from "../organizations";

export async function checkActiveOrganizationAction(): Promise<boolean> {
  try {
    const org = await getFullOrganization();
    return Boolean(org && org.id);
  } catch (error) {
    return false;
  }
}
