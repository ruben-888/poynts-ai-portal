/**
 * Proxy Client for Backend API
 *
 * Handles HTTP forwarding to the Loopback backend API with proper
 * authentication, organization context, and error handling.
 */

import { NextResponse } from "next/server";
import { resolveApiKey } from "./api-key-resolver";
import type { ProxyOptions, ProxyConfig, BackendApiResponse } from "./types";

const BACKEND_BASE_URL =
  process.env.BACKEND_API_URL ||
  "https://carecloud-api-423331836390.us-west2.run.app";

/**
 * Forward a request to the backend API
 *
 * @param options - Request options (method, path, body, queryParams)
 * @param config - Proxy configuration (isAdminRoute, includeOrgId)
 * @returns Backend API response data
 */
export async function proxyRequest<T = unknown>(
  options: ProxyOptions,
  config: ProxyConfig = {}
): Promise<BackendApiResponse<T>> {
  const { isAdminRoute = false, includeOrgId = true } = config;

  // Resolve API key and organization context
  const { apiKey, organizationId } = await resolveApiKey(isAdminRoute);

  // Build query params
  const queryParams = new URLSearchParams(options.queryParams || {});

  // Add organization_id if using org-scoped access
  if (includeOrgId && organizationId) {
    queryParams.set("organization_id", organizationId);
  }

  // Build URL
  const queryString = queryParams.toString();
  const url = `${BACKEND_BASE_URL}${options.path}${queryString ? `?${queryString}` : ""}`;

  try {
    // Make request to backend
    const response = await fetch(url, {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: undefined as T };
    }

    // Parse response
    const data = await response.json().catch(() => ({}));

    // Handle error responses from backend
    if (!response.ok) {
      const errorMessage =
        data.error?.message || data.message || `Backend error: ${response.status}`;

      console.error(`Backend API error [${response.status}]:`, {
        url,
        method: options.method,
        error: errorMessage,
      });

      return {
        error: {
          statusCode: response.status,
          message: errorMessage,
          name: data.error?.name || "BackendError",
        },
      };
    }

    return data as BackendApiResponse<T>;
  } catch (error) {
    console.error("Proxy request failed:", {
      url,
      method: options.method,
      error: error instanceof Error ? error.message : error,
    });

    return {
      error: {
        statusCode: 502,
        message: error instanceof Error ? error.message : "Backend connection failed",
        name: "BadGateway",
      },
    };
  }
}

/**
 * Create a NextResponse from backend response
 *
 * @param result - Backend API response
 * @param successStatus - HTTP status for successful responses (default: 200)
 * @returns NextResponse with appropriate status and body
 */
export function createProxyResponse<T>(
  result: BackendApiResponse<T>,
  successStatus: number = 200
): NextResponse {
  if (result.error) {
    const status = result.error.statusCode || 500;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json(result, { status: successStatus });
}

/**
 * Forward a request and return NextResponse
 *
 * Combines proxyRequest and createProxyResponse for convenience.
 *
 * @param options - Request options (method, path, body, queryParams)
 * @param config - Proxy configuration (isAdminRoute, includeOrgId)
 * @param successStatus - HTTP status for successful responses (default: 200)
 * @returns NextResponse ready to return from route handler
 */
export async function forwardRequest<T = unknown>(
  options: ProxyOptions,
  config: ProxyConfig = {},
  successStatus: number = 200
): Promise<NextResponse> {
  try {
    const result = await proxyRequest<T>(options, config);
    return createProxyResponse(result, successStatus);
  } catch (error) {
    console.error("Forward request failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Extract query parameters from a Request URL
 *
 * @param request - The incoming Request object
 * @returns Record of query parameter key-value pairs
 */
export function extractQueryParams(request: Request): Record<string, string> {
  const { searchParams } = new URL(request.url);
  const queryParams: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    // Don't pass organization_id from client - we add it ourselves
    if (key !== "organization_id") {
      queryParams[key] = value;
    }
  });

  return queryParams;
}

/**
 * Parse JSON body from request with error handling
 *
 * @param request - The incoming Request object
 * @returns Parsed JSON body or null if no body/invalid JSON
 */
export async function parseBody<T = unknown>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    return null;
  }
}
