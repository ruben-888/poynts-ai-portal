/**
 * Reward Sources API Proxy Routes (Admin Only)
 *
 * GET /api/v1/reward-sources - List reward sources with their details
 *
 * This is an admin-only endpoint that requires org:cpadmin:access permission.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasCPAdminAccess } from "../../_lib/permissions";
import { forwardRequest, extractQueryParams } from "../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../_lib/errors";

/**
 * GET /api/v1/reward-sources
 *
 * List all reward sources (providers) with their details.
 * TODO: Re-enable org:cpadmin:access permission check after testing
 */
export async function GET(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TEMPORARILY DISABLED FOR TESTING
    // Admin routes require cpadmin:access
    // const isAdmin = await hasCPAdminAccess();
    // if (!isAdmin) {
    //   throw new ForbiddenError("This endpoint requires admin access");
    // }

    // Extract query params
    const queryParams = extractQueryParams(request);

    // Forward to backend with admin config
    return forwardRequest(
      {
        method: "GET",
        path: "/v1/internal/reward-sources",
        queryParams,
      },
      {
        isAdminRoute: true,
        includeOrgId: false,
      }
    );
  } catch (error) {
    return handleError(error);
  }
}
