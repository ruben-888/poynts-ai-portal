/**
 * Members API Proxy Routes
 *
 * GET  /api/v1/members - List members for the organization
 * POST /api/v1/members - Create a new member
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../_lib/permissions";
import { forwardRequest, extractQueryParams, parseBody } from "../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../_lib/errors";

/**
 * GET /api/v1/members
 *
 * List members for the authenticated user's organization.
 * Requires org:members:view permission.
 */
export async function GET(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check domain permission
    const hasPermission = await checkDomainPermission("members", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view members");
    }

    // Extract query params (excluding organization_id which we add automatically)
    const queryParams = extractQueryParams(request);

    // Forward to backend
    return forwardRequest({
      method: "GET",
      path: "/members",
      queryParams,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/v1/members
 *
 * Create a new member in the authenticated user's organization.
 * Requires org:members:manage permission.
 */
export async function POST(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check domain permission
    const hasPermission = await checkDomainPermission("members", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage members");
    }

    // Parse request body
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Forward to backend
    return forwardRequest(
      {
        method: "POST",
        path: "/members",
        body,
      },
      {},
      201 // Created status
    );
  } catch (error) {
    return handleError(error);
  }
}
