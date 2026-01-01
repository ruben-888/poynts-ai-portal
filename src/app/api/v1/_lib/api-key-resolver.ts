/**
 * API Key Resolution for Backend Proxy
 *
 * Determines which API key to use when forwarding requests to the backend API.
 * - Super admin routes use the BACKEND_API_KEY environment variable
 * - Organization routes use the same key but include organization_id filtering
 */

import { auth } from "@clerk/nextjs/server";
import { postgresDb } from "@/utils/postgres-db";
import { hasCPAdminAccess } from "./permissions";
import type { ResolvedApiKey } from "./types";

/**
 * Resolve which API key to use for backend requests
 *
 * Logic:
 * 1. If isAdminRoute is true → superadmin key without org filter (for development)
 * 2. Otherwise → superadmin key WITH organization_id filter based on user's org
 *
 * @param isAdminRoute - Whether this is an admin-only route (cross-org access)
 * @returns ResolvedApiKey with apiKey and optional organizationId
 * @throws Error if no API key is configured or organization is not found
 */
export async function resolveApiKey(isAdminRoute: boolean = false): Promise<ResolvedApiKey> {
  const superadminKey = process.env.BACKEND_API_KEY;

  if (!superadminKey) {
    throw new Error("BACKEND_API_KEY environment variable is not set");
  }

  // For admin routes, use key without org filter
  // TODO: Re-enable CP admin permission check once org migration is complete
  if (isAdminRoute) {
    return {
      apiKey: superadminKey,
      organizationId: undefined, // Admin key can access all orgs
    };
  }

  // For regular routes, resolve the organization ID and include it
  const organizationId = await getOrganizationId();

  return {
    apiKey: superadminKey,
    organizationId,
  };
}

/**
 * Get the PostgreSQL organization ID for the current user's Clerk org
 *
 * Maps the Clerk organization ID to the internal PostgreSQL organizations.id
 *
 * @returns The PostgreSQL organization ID
 * @throws Error if no organization context or organization not found
 */
export async function getOrganizationId(): Promise<string> {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("No organization context found");
  }

  const organization = await postgresDb.organizations.findFirst({
    where: { auth_provider_org_id: orgId },
    select: { id: true },
  });

  if (!organization) {
    throw new Error(`Organization not found for Clerk org: ${orgId}`);
  }

  return organization.id;
}

/**
 * Get the full organization record for the current user's Clerk org
 *
 * @returns The PostgreSQL organization record
 * @throws Error if no organization context or organization not found
 */
export async function getOrganization(): Promise<{
  id: string;
  name: string;
  status: string | null;
}> {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("No organization context found");
  }

  const organization = await postgresDb.organizations.findFirst({
    where: { auth_provider_org_id: orgId },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  if (!organization) {
    throw new Error(`Organization not found for Clerk org: ${orgId}`);
  }

  return organization;
}

/**
 * Check if an organization exists by its Clerk org ID
 *
 * @param clerkOrgId - The Clerk organization ID
 * @returns Whether the organization exists in PostgreSQL
 */
export async function organizationExists(clerkOrgId: string): Promise<boolean> {
  const organization = await postgresDb.organizations.findFirst({
    where: { auth_provider_org_id: clerkOrgId },
    select: { id: true },
  });

  return !!organization;
}
