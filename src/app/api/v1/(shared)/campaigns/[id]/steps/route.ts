/**
 * Campaign Steps API Proxy Routes
 *
 * GET  /api/v1/campaigns/[id]/steps - List steps for a campaign
 * POST /api/v1/campaigns/[id]/steps - Create a new step
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../../../_lib/permissions";
import { forwardRequest, extractQueryParams, parseBody } from "../../../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../../../_lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/campaigns/[id]/steps
 *
 * List steps for a campaign.
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
    const queryParams = extractQueryParams(request);

    return forwardRequest({
      method: "GET",
      path: `/v1/campaigns/${id}/steps`,
      queryParams,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/v1/campaigns/[id]/steps
 *
 * Create a new step for a campaign.
 * Requires org:campaigns:manage permission.
 */
export async function POST(request: Request, { params }: RouteParams) {
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

    return forwardRequest(
      {
        method: "POST",
        path: `/v1/campaigns/${id}/steps`,
        body,
      },
      {},
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
