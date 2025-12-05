/**
 * Catalogs API Proxy Routes - Clone Catalog
 *
 * POST /api/v1/catalogs/[id]/clone - Clone an existing catalog
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../../../_lib/permissions";
import { forwardRequest, parseBody } from "../../../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../../../_lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/catalogs/[id]/clone
 *
 * Clone an existing catalog.
 * Requires org:catalogs:manage permission.
 */
export async function POST(request: Request, { params }: RouteParams) {
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

    return forwardRequest(
      {
        method: "POST",
        path: `/catalogs/${id}/clone`,
        body: body || undefined,
      },
      {},
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
