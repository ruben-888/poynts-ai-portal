/**
 * Catalogs API Proxy Routes - Single Catalog
 *
 * GET    /api/v1/catalogs/[id] - Get a single catalog
 * PATCH  /api/v1/catalogs/[id] - Update a catalog
 * DELETE /api/v1/catalogs/[id] - Archive a catalog
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
 * GET /api/v1/catalogs/[id]
 *
 * Get a single catalog by ID.
 * Requires org:catalogs:view permission.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("catalogs", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view catalogs");
    }

    const { id } = await params;

    return forwardRequest({
      method: "GET",
      path: `/catalogs/${id}`,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/v1/catalogs/[id]
 *
 * Update a catalog by ID.
 * Requires org:catalogs:manage permission.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("catalogs", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage catalogs");
    }

    const { id } = await params;
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return forwardRequest({
      method: "PATCH",
      path: `/catalogs/${id}`,
      body,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/catalogs/[id]
 *
 * Archive a catalog by ID.
 * Requires org:catalogs:manage permission.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("catalogs", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage catalogs");
    }

    const { id } = await params;

    return forwardRequest(
      {
        method: "DELETE",
        path: `/catalogs/${id}`,
      },
      {},
      204
    );
  } catch (error) {
    return handleError(error);
  }
}
