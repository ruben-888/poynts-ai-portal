/**
 * Organizations API Proxy Routes (Admin Only)
 *
 * GET /api/v1/organizations - List all organizations (cross-org access)
 *
 * This is an admin-only endpoint that requires org:cpadmin:access permission.
 * It uses the superadmin API key without organization filtering.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasCPAdminAccess } from "../../_lib/permissions";
import { forwardRequest, extractQueryParams } from "../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../_lib/errors";

/**
 * GET /api/v1/organizations
 *
 * List all organizations (admin access only).
 * Requires org:cpadmin:access permission.
 */
export async function GET(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin routes require cpadmin:access
    const isAdmin = await hasCPAdminAccess();
    if (!isAdmin) {
      throw new ForbiddenError("This endpoint requires admin access");
    }

    // Extract query params
    const queryParams = extractQueryParams(request);

    // Forward to backend with admin config (no org filter)
    return forwardRequest(
      {
        method: "GET",
        path: "/organizations",
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
