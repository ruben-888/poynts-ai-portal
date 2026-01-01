/**
 * Programs API Proxy Routes - Single Program
 *
 * GET    /api/v1/programs/[id] - Get a single program (with tiers)
 * PATCH  /api/v1/programs/[id] - Update a program
 * DELETE /api/v1/programs/[id] - Delete a program
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
 * GET /api/v1/programs/[id]
 *
 * Get a single program by ID with its tier definitions.
 * Requires org:programs:view permission.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("programs", "view");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to view programs");
    }

    const { id } = await params;

    return forwardRequest({
      method: "GET",
      path: `/v1/programs/${id}`,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/v1/programs/[id]
 *
 * Update a program by ID.
 * Requires org:programs:manage permission.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("programs", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage programs");
    }

    const { id } = await params;
    const body = await parseBody(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    return forwardRequest({
      method: "PATCH",
      path: `/v1/programs/${id}`,
      body,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/programs/[id]
 *
 * Delete a program by ID.
 * Requires org:programs:manage permission.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("programs", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage programs");
    }

    const { id } = await params;

    return forwardRequest(
      {
        method: "DELETE",
        path: `/v1/programs/${id}`,
      },
      {},
      204
    );
  } catch (error) {
    return handleError(error);
  }
}
