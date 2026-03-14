/**
 * Internal Config API Proxy Routes
 *
 * GET  /api/v1/internal/config/:key - Get config value
 * PUT  /api/v1/internal/config/:key - Update config value
 *
 * Admin-only. No org filtering.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, parseBody } from "../../../../_lib/proxy-client";
import { handleError } from "../../../../_lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key } = await params;

    return forwardRequest(
      {
        method: "GET",
        path: `/v1/internal/config/${key}`,
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key } = await params;
    const body = await parseBody(request);

    return forwardRequest(
      {
        method: "PUT",
        path: `/v1/internal/config/${key}`,
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
