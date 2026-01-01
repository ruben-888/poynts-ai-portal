/**
 * Rewards API Proxy Route (Admin Only)
 *
 * GET /api/v1/rewards - List all global rewards
 *
 * Query params:
 *   - status: Filter by status (active, inactive, pending, suspended)
 *   - type: Filter by type (gift_card, offer)
 *   - brand_fk: Filter by brand ID
 *   - source_fk: Filter by source ID
 *   - search: Search by name
 *   - include_brand: Include brand relation
 *   - include_source: Include source relation
 *   - limit: Max results (default 20)
 *   - offset: Pagination offset
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, extractQueryParams } from "../../_lib/proxy-client";
import { handleError } from "../../_lib/errors";

/**
 * GET /api/v1/rewards
 *
 * Fetch all global rewards with optional filtering.
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
        path: "/v1/internal/rewards",
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
