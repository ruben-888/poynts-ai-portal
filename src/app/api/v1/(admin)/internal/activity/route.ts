/**
 * Internal Activity API Proxy Routes (Admin Only)
 *
 * POST /api/v1/internal/activity - Log UI activity for tracking
 *
 * This is an admin-only endpoint that requires org:cpadmin:access permission.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasCPAdminAccess } from "../../../_lib/permissions";
import { forwardRequest, parseBody } from "../../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../../_lib/errors";

/**
 * POST /api/v1/internal/activity
 *
 * Log UI activity for tracking purposes.
 * Requires org:cpadmin:access permission.
 */
export async function POST(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin routes require cpadmin:access
    const isAdmin = await hasCPAdminAccess();
    if (!isAdmin) {
      throw new ForbiddenError("This endpoint requires admin access");
    }

    // Parse request body
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Forward to backend with admin config
    return forwardRequest(
      {
        method: "POST",
        path: "/internal/activity",
        body,
      },
      {
        isAdminRoute: true,
        includeOrgId: false,
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
