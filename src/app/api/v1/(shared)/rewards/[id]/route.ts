/**
 * Rewards API Proxy Routes - Single Reward
 *
 * GET /api/v1/rewards/[id] - Get a single reward
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../../_lib/permissions";
import { forwardRequest } from "../../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../../_lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/rewards/[id]
 *
 * Get a single reward by ID.
 * Requires org:rewards:view permission.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("rewards", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view rewards");
    }

    const { id } = await params;

    return forwardRequest({
      method: "GET",
      path: `/rewards/${id}`,
    });
  } catch (error) {
    return handleError(error);
  }
}
