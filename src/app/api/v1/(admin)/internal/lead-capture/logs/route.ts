/**
 * Lead Capture Logs API Proxy Routes
 *
 * GET /api/v1/internal/lead-capture/logs - List lead capture logs
 *
 * Admin-only. Supports limit, offset, status query params.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, extractQueryParams } from "../../../../_lib/proxy-client";
import { handleError } from "../../../../_lib/errors";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryParams = extractQueryParams(request);

    return forwardRequest(
      {
        method: "GET",
        path: "/v1/internal/lead-capture/logs",
        queryParams,
      },
      {
        isAdminRoute: true,
        includeOrgId: false,
      }
    );
  } catch (error) {
    return handleError(error);
  }
}
