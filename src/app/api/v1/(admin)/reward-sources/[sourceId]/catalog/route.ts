/**
 * Reward Sources Catalog API Proxy Route (Admin Only)
 *
 * GET /api/v1/reward-sources/[sourceId]/catalog - Fetch catalog from any reward source
 *
 * Supported sources: source-tremendous, source-tango, source-blackhawk
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, extractQueryParams } from "../../../../_lib/proxy-client";
import { handleError } from "../../../../_lib/errors";

interface RouteParams {
  params: Promise<{ sourceId: string }>;
}

/**
 * GET /api/v1/reward-sources/[sourceId]/catalog
 *
 * Fetch catalog items from a reward source.
 * Query params:
 *   - limit: number of items to return
 *   - offset: pagination offset
 *   - include_raw: include raw provider data (default: false)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sourceId } = await params;

    // Extract query params (limit, offset, include_raw, etc.)
    const queryParams = extractQueryParams(request);

    // Forward to backend
    return forwardRequest(
      {
        method: "GET",
        path: `/v1/internal/reward-sources/${sourceId}/catalog`,
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
