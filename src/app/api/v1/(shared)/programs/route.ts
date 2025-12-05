/**
 * Programs API Proxy Routes
 *
 * GET  /api/v1/programs - List programs for the organization
 * POST /api/v1/programs - Create a new program
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../_lib/permissions";
import { forwardRequest, extractQueryParams, parseBody } from "../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../_lib/errors";

/**
 * GET /api/v1/programs
 *
 * List programs for the authenticated user's organization.
 * Requires org:programs:view permission.
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("programs", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view programs");
    }

    const queryParams = extractQueryParams(request);

    return forwardRequest({
      method: "GET",
      path: "/programs",
      queryParams,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/v1/programs
 *
 * Create a new program in the authenticated user's organization.
 * Requires org:programs:manage permission.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("programs", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage programs");
    }

    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return forwardRequest(
      {
        method: "POST",
        path: "/programs",
        body,
      },
      {},
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
