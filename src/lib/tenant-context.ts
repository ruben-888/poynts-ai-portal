import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";

/**
 * Tenant context information
 */
export interface TenantContext {
  clerkOrgId: string;
  orgSlug: string | null;
  orgRole: string | null;
  cpClient: {
    id: number;
    ent_id: number;
    name: string;
    client_id: string;
  } | null;
}

/**
 * Get the current tenant context from Clerk authentication
 * and lookup the corresponding cp_client record
 *
 * @throws Error if no organization context is found
 * @returns Promise<TenantContext>
 */
export async function getTenantContext(): Promise<TenantContext> {
  const { orgId, orgSlug, orgRole } = await auth();

  if (!orgId) {
    throw new Error("No organization context found. User must be logged in and have an active organization.");
  }

  // Get the cp_client record for this Clerk organization
  const client = await db.cp_clients.findFirst({
    where: {
      auth_provider_org_id: orgId
    },
    select: {
      id: true,
      ent_id: true,
      name: true,
      client_id: true
    }
  });

  return {
    clerkOrgId: orgId,
    orgSlug: orgSlug || null,
    orgRole: orgRole || null,
    cpClient: client
  };
}

/**
 * Get just the Clerk org ID from the current auth context
 * Simpler version when you don't need the full cp_client lookup
 *
 * @throws Error if no organization context is found
 * @returns Promise<string>
 */
export async function getOrgId(): Promise<string> {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("No organization context found");
  }

  return orgId;
}

/**
 * Get the internal enterprise ID (ent_id) from a Clerk organization ID
 *
 * @param clerkOrgId - The Clerk organization ID
 * @returns Promise<number> - The internal ent_id from cp_clients
 * @throws Error if organization is not found
 */
export async function getEntIdFromClerkOrg(clerkOrgId: string): Promise<number> {
  const client = await db.cp_clients.findFirst({
    where: {
      auth_provider_org_id: clerkOrgId
    },
    select: {
      ent_id: true
    }
  });

  if (!client) {
    throw new Error(`Organization with Clerk ID "${clerkOrgId}" not found`);
  }

  return client.ent_id;
}

/**
 * Get the internal enterprise ID for the currently authenticated user's organization
 *
 * @returns Promise<number> - The internal ent_id from cp_clients
 * @throws Error if no organization context or organization not found
 */
export async function getCurrentEntId(): Promise<number> {
  const clerkOrgId = await getOrgId();
  return getEntIdFromClerkOrg(clerkOrgId);
}
