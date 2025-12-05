/**
 * Catalogs API Proxy Routes
 *
 * GET  /api/v1/catalogs - List catalogs for the organization
 * POST /api/v1/catalogs - Create a new catalog
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../_lib/permissions";
import { forwardRequest, extractQueryParams, parseBody } from "../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../_lib/errors";

/**
 * GET /api/v1/catalogs
 *
 * List catalogs for the authenticated user's organization.
 * Requires org:catalogs:view permission.
 */
export async function GET(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check domain permission
    const hasPermission = await checkDomainPermission("catalogs", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view catalogs");
    }

    // Extract query params
    const queryParams = extractQueryParams(request);

    // Forward to backend
    return forwardRequest({
      method: "GET",
      path: "/catalogs",
      queryParams,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/v1/catalogs
 *
 * Create a new catalog in the authenticated user's organization.
 * Requires org:catalogs:manage permission.
 */
export async function POST(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check domain permission
    const hasPermission = await checkDomainPermission("catalogs", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage catalogs");
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
        path: "/catalogs",
        body,
      },
      {},
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
