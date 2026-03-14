/**
 * Lead Capture Webhook API Proxy Route
 *
 * POST /api/v1/internal/lead-capture/webhook - Submit a lead capture form
 *
 * Admin-only. Supports ?live=true query param.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, extractQueryParams, parseBody } from "../../../../_lib/proxy-client";
import { handleError } from "../../../../_lib/errors";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryParams = extractQueryParams(request);
    const body = await parseBody(request);

    return forwardRequest(
      {
        method: "POST",
        path: "/v1/internal/lead-capture/webhook",
        queryParams,
        body,
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
