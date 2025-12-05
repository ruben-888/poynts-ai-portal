/**
 * Members API Proxy Routes - Single Member
 *
 * GET   /api/v1/members/[id] - Get a single member
 * PATCH /api/v1/members/[id] - Update a member
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
 * GET /api/v1/members/[id]
 *
 * Get a single member by ID.
 * Requires org:members:view permission.
 */
export async function GET(request: Request, { params }: RouteParams) {
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

    // Get member ID from route params
    const { id } = await params;

    // Forward to backend
    return forwardRequest({
      method: "GET",
      path: `/members/${id}`,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/v1/members/[id]
 *
 * Update a member by ID.
 * Requires org:members:manage permission.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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

    // Get member ID from route params
    const { id } = await params;

    // Parse request body
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Forward to backend
    return forwardRequest({
      method: "PATCH",
      path: `/members/${id}`,
      body,
    });
  } catch (error) {
    return handleError(error);
  }
}
