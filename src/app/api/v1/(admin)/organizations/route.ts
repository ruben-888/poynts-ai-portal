/**
 * Organizations API Proxy Routes
 *
 * GET /api/v1/organizations - List all organizations (cross-org access)
 *
 * This endpoint is accessible to any authenticated user.
 * It uses the superadmin API key without organization filtering.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, extractQueryParams } from "../../_lib/proxy-client";
import { handleError } from "../../_lib/errors";

/**
 * GET /api/v1/organizations
 *
 * List all organizations.
 * Requires authentication.
 */
export async function GET(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query params
    const queryParams = extractQueryParams(request);

    // Forward to backend with admin config (no org filter)
    return forwardRequest(
      {
        method: "GET",
        path: "/v1/organizations",
        queryParams,
      },
      {
        isAdminRoute: true,
        includeOrgId: false, // Admin can see all orgs
      }
    );
  } catch (error) {
    return handleError(error);
  }
}
