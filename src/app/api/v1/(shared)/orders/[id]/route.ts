/**
 * Orders API Proxy Routes - Single Order
 *
 * GET   /api/v1/orders/[id] - Get a single order
 * PATCH /api/v1/orders/[id] - Update an order
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
 * GET /api/v1/orders/[id]
 *
 * Get a single order by ID.
 * Requires org:orders:view permission.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("orders", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view orders");
    }

    const { id } = await params;

    return forwardRequest({
      method: "GET",
      path: `/v1/orders/${id}`,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/v1/orders/[id]
 *
 * Update an order by ID.
 * Requires org:orders:manage permission.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("orders", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage orders");
    }

    const { id } = await params;
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return forwardRequest({
      method: "PATCH",
      path: `/v1/orders/${id}`,
      body,
    });
  } catch (error) {
    return handleError(error);
  }
}
