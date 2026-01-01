/**
 * Reward Source Catalog Sync API Proxy Route (Admin Only)
 *
 * POST /api/v1/reward-sources/[sourceId]/catalog/sync
 *
 * Syncs catalog items from a provider to RewardSourceItems.
 * Creates or updates RewardSourceItem records for the specified identifiers.
 *
 * Request body:
 *   - sourceIdentifiers: string[] - List of identifiers (UTIDs, etc.) to sync
 *   - rewardId?: string - Optional reward ID to link items to
 *   - priority?: number - Fulfillment priority (lower = higher priority, default: 0)
 *
 * Response:
 *   - created: number - Count of newly created items
 *   - updated: number - Count of updated items
 *   - items: RewardSourceItem[] - The created/updated items
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, parseBody } from "../../../../../_lib/proxy-client";
import { handleError } from "../../../../../_lib/errors";

interface RouteParams {
  params: Promise<{ sourceId: string }>;
}

interface SyncRequest {
  sourceIdentifiers: string[];
  rewardId?: string;
  priority?: number;
}

/**
 * POST /api/v1/reward-sources/[sourceId]/catalog/sync
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sourceId } = await params;

    const body = await parseBody<SyncRequest>(request);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!body.sourceIdentifiers || !Array.isArray(body.sourceIdentifiers)) {
      return NextResponse.json(
        { error: "sourceIdentifiers is required and must be an array" },
        { status: 400 }
      );
    }

    return forwardRequest(
      {
        method: "POST",
        path: `/v1/internal/reward-sources/${sourceId}/catalog/sync`,
        body,
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
