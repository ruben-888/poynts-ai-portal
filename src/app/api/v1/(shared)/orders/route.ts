/**
 * Orders API Proxy Routes
 *
 * GET  /api/v1/orders - List orders for the organization
 * POST /api/v1/orders - Create a new order
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../_lib/permissions";
import { forwardRequest, extractQueryParams, parseBody } from "../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../_lib/errors";

/**
 * GET /api/v1/orders
 *
 * List orders for the authenticated user's organization.
 * Requires org:orders:view permission.
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("orders", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view orders");
    }

    const queryParams = extractQueryParams(request);

    return forwardRequest({
      method: "GET",
      path: "/orders",
      queryParams,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/v1/orders
 *
 * Create a new order in the authenticated user's organization.
 * Requires org:orders:manage permission.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("orders", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage orders");
    }

    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return forwardRequest(
      {
        method: "POST",
        path: "/orders",
        body,
      },
      {},
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
