/**
 * Tenant Resolution Utility
 *
 * Replaces hard-coded tenant IDs with database lookups.
 * Currently hard-coded to WellCo tenant for single-tenant operation.
 *
 * TODO: Multi-tenant expansion
 * When expanding to support multiple organizations:
 * - Map Clerk org IDs to tenant IDs via cp_clients.auth_provider_org_id (already implemented in getTenantIdFromOrgId)
 * - Remove historical org slug usage once org ID support is fully implemented
 * - Add tenant selection UI for users with access to multiple tenants
 * - Implement tenant-scoped data access patterns across all services
 */

import { db } from "@/utils/db";

/**
 * Maps a Clerk organization ID to a tenant ID
 *
 * Looks up the cp_clients table by auth_provider_org_id and returns the id,
 * which is used as tenant_id in tenant_registry_redemptions filtering.
 *
 * @param clerkOrgId - The Clerk organization ID
 * @returns The numeric tenant ID (cp_clients.id)
 * @throws Error if no cp_client found for the org_id
 */
export async function getTenantIdFromOrgId(clerkOrgId: string): Promise<number> {
  console.log('[getTenantIdFromOrgId] Looking up org_id:', clerkOrgId);

  const client = await db.cp_clients.findFirst({
    where: {
      auth_provider_org_id: clerkOrgId
    },
    select: {
      id: true,
      name: true
    }
  });

  if (!client) {
    console.error('[getTenantIdFromOrgId] No cp_client found for org_id:', clerkOrgId);
    throw new Error(`No cp_client found for org_id ${clerkOrgId}`);
  }

  console.log('[getTenantIdFromOrgId] Found tenant:', { name: client.name, tenant_id: client.id });
  return client.id;
}
