import { db } from "@/utils/db";

/**
 * Verifies that an organization has permission to view a specific enterprise's catalog
 * @param orgId - The Clerk organization ID
 * @param enterpriseId - The enterprise ID to check access for
 * @returns Promise<boolean> - True if the org has access, false otherwise
 */
export async function verifyOrgHasCatalogAccess(
  orgId: string,
  enterpriseId: number,
): Promise<boolean> {
  try {
    // Get tenant's root enterprise from cp_clients table
    const tenant = await db.cp_clients.findFirst({
      where: { auth_provider_org_id: orgId },
      select: { ent_id: true },
    });

    if (!tenant) {
      return false;
    }

    // Recursively check if enterpriseId is in the tenant's hierarchy
    return await isEnterpriseInHierarchy(enterpriseId, tenant.ent_id);
  } catch (error) {
    console.error("Error verifying catalog access:", error);
    return false;
  }
}

/**
 * Recursively checks if an enterprise is in the hierarchy leading to the target
 * @param currentEntId - The current enterprise ID being checked
 * @param targetEntId - The target enterprise ID to find in the hierarchy
 * @returns Promise<boolean> - True if currentEntId is in the path to targetEntId
 */
async function isEnterpriseInHierarchy(
  currentEntId: number,
  targetEntId: number,
): Promise<boolean> {
  // Check if we've reached the target
  if (currentEntId === targetEntId) {
    return true;
  }

  // Look up the current enterprise
  const enterprise = await db.enterprise.findFirst({
    where: { ent_id: currentEntId },
    select: { ent_id_parent: true },
  });

  // No enterprise found or no parent - dead end
  if (!enterprise || !enterprise.ent_id_parent) {
    return false;
  }

  // Recursively check the parent
  return isEnterpriseInHierarchy(enterprise.ent_id_parent, targetEntId);
}
