/**
 * Permission utilities for the API proxy layer
 *
 * Maps domains to Clerk permission strings and provides
 * utilities for checking permissions.
 */

import { auth } from "@clerk/nextjs/server";

/**
 * Domain-specific permission mappings
 * Maps each domain to its view and manage permissions
 */
export const DOMAIN_PERMISSIONS = {
  members: { view: "org:members:view", manage: "org:members:manage" },
  catalogs: { view: "org:catalogs:view", manage: "org:catalogs:manage" },
  campaigns: { view: "org:campaigns:view", manage: "org:campaigns:manage" },
  programs: { view: "org:programs:view", manage: "org:programs:manage" },
  orders: { view: "org:orders:view", manage: "org:orders:manage" },
  rewards: { view: "org:rewards:view", manage: "org:rewards:manage" },
  organizations: { view: "org:cpadmin:access", manage: "org:cpadmin:access" },
  internal: { view: "org:cpadmin:access", manage: "org:cpadmin:access" },
} as const;

export type Domain = keyof typeof DOMAIN_PERMISSIONS;
export type Operation = "view" | "manage";

/**
 * Check if user has the required permission for a domain and operation
 *
 * @param domain - The resource domain (members, catalogs, etc.)
 * @param operation - The operation type (view for GET, manage for mutations)
 * @returns Whether the user has the required permission
 */
export async function checkDomainPermission(
  domain: Domain,
  operation: Operation
): Promise<boolean> {
  const { has } = await auth();
  const permission = DOMAIN_PERMISSIONS[domain][operation];
  return has({ permission });
}

/**
 * Determine the required operation based on HTTP method
 *
 * @param method - HTTP method (GET, POST, PATCH, etc.)
 * @returns "view" for GET requests, "manage" for all others
 */
export function getRequiredOperation(method: string): Operation {
  return method === "GET" ? "view" : "manage";
}

/**
 * Check if user has superadmin access (org:cpadmin:access permission)
 *
 * @returns Whether the user has CP admin access
 */
export async function hasCPAdminAccess(): Promise<boolean> {
  const { has } = await auth();
  return has({ permission: "org:cpadmin:access" });
}

/**
 * Check if user is authenticated
 *
 * @returns Object with userId if authenticated, null if not
 */
export async function requireAuth(): Promise<{ userId: string; orgId: string }> {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("No organization context");
  }

  return { userId, orgId };
}
