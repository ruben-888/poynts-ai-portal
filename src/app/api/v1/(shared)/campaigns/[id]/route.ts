/**
 * Campaigns API Proxy Routes - Single Campaign
 *
 * GET    /api/v1/campaigns/[id] - Get a single campaign (with steps)
 * PATCH  /api/v1/campaigns/[id] - Update a campaign
 * DELETE /api/v1/campaigns/[id] - Delete a campaign
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../../_lib/permissions";
import { forwardRequest, parseBody } from "../../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../../_lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/campaigns/[id]
 *
 * Get a single campaign by ID with its steps.
 * Requires org:campaigns:view permission.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("campaigns", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view campaigns");
    }

    const { id } = await params;

    return forwardRequest({
      method: "GET",
      path: `/v1/campaigns/${id}`,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/v1/campaigns/[id]
 *
 * Update a campaign by ID.
 * Requires org:campaigns:manage permission.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("campaigns", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage campaigns");
    }

    const { id } = await params;
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return forwardRequest({
      method: "PATCH",
      path: `/v1/campaigns/${id}`,
      body,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/campaigns/[id]
 *
 * Delete a campaign by ID.
 * Requires org:campaigns:manage permission.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("campaigns", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage campaigns");
    }

    const { id } = await params;

    return forwardRequest(
      {
        method: "DELETE",
        path: `/v1/campaigns/${id}`,
      },
      {},
      204
    );
  } catch (error) {
    return handleError(error);
  }
}
