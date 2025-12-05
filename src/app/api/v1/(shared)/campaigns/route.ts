/**
 * Campaigns API Proxy Routes
 *
 * GET  /api/v1/campaigns - List campaigns for the organization
 * POST /api/v1/campaigns - Create a new campaign
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../_lib/permissions";
import { forwardRequest, extractQueryParams, parseBody } from "../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../_lib/errors";

/**
 * GET /api/v1/campaigns
 *
 * List campaigns for the authenticated user's organization.
 * Requires org:campaigns:view permission.
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("campaigns", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view campaigns");
    }

    const queryParams = extractQueryParams(request);

    return forwardRequest({
      method: "GET",
      path: "/campaigns",
      queryParams,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/v1/campaigns
 *
 * Create a new campaign in the authenticated user's organization.
 * Requires org:campaigns:manage permission.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("campaigns", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage campaigns");
    }

    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return forwardRequest(
      {
        method: "POST",
        path: "/campaigns",
        body,
      },
      {},
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
