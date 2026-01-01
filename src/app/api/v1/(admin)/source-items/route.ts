/**
 * Source Items API Proxy Route (Admin Only)
 *
 * GET /api/v1/source-items - List all imported source items across all providers
 *
 * Query params:
 *   - source_fk: Filter by source (e.g., source-tremendous)
 *   - reward_fk: Filter by linked reward ID
 *   - status: Filter by status (active, inactive)
 *   - linked: true = linked to reward, false = unlinked
 *   - search: Search by source_identifier
 *   - include_source: Include source relation
 *   - include_reward: Include reward relation
 *   - limit: Max 1000, default 100
 *   - offset: Pagination offset
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, extractQueryParams } from "../../_lib/proxy-client";
import { handleError } from "../../_lib/errors";

/**
 * GET /api/v1/source-items
 *
 * Fetch all source items across all providers with optional filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryParams = extractQueryParams(request);

    return forwardRequest(
      {
        method: "GET",
        path: "/v1/internal/source-items",
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
