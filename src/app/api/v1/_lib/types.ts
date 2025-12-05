/**
 * Shared types for the API proxy layer
 */

export interface ProxyRequestContext {
  userId: string;
  orgId: string;
  orgSlug: string | null;
  organizationId: string; // PostgreSQL organizations.id
  isCPAdmin: boolean;
  apiKey: string;
}

export interface BackendApiResponse<T = unknown> {
  data?: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    timestamp?: string;
  };
  error?: {
    statusCode?: number;
    name?: string;
    message?: string;
  };
  // Pagination fields (some endpoints return these at root level)
  limit?: number;
  offset?: number;
}

export interface ResolvedApiKey {
  apiKey: string;
  organizationId: string | undefined; // undefined for superadmin cross-org queries
}

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ProxyOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  queryParams?: Record<string, string>;
}

export interface ProxyConfig {
  /** Whether this is an admin-only route (uses superadmin key without org filter) */
  isAdminRoute?: boolean;
  /** Whether to include organization_id in the request (default: true) */
  includeOrgId?: boolean;
}
