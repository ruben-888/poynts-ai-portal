/**
 * Lead Capture Log Detail API Proxy Route
 *
 * GET /api/v1/internal/lead-capture/logs/:id - Get single log entry
 *
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest } from "../../../../../_lib/proxy-client";
import { handleError } from "../../../../../_lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    return forwardRequest(
      {
        method: "GET",
        path: `/v1/internal/lead-capture/logs/${id}`,
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
