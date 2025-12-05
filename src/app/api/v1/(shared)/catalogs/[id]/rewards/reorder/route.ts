/**
 * Catalogs API Proxy Routes - Reorder Rewards
 *
 * PUT /api/v1/catalogs/[id]/rewards/reorder - Reorder rewards in a catalog
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../../../../_lib/permissions";
import { forwardRequest, parseBody } from "../../../../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../../../../_lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/v1/catalogs/[id]/rewards/reorder
 *
 * Reorder rewards within a catalog.
 * Requires org:catalogs:manage permission.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("catalogs", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage catalogs");
    }

    const { id } = await params;
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return forwardRequest({
      method: "PUT",
      path: `/catalogs/${id}/rewards/reorder`,
      body,
    });
  } catch (error) {
    return handleError(error);
  }
}
