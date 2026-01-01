/**
 * Campaign Enrollment API Proxy Routes
 *
 * POST   /api/v1/campaigns/[id]/members/[memberId]/enroll - Enroll member in campaign
 * DELETE /api/v1/campaigns/[id]/members/[memberId]/enroll - Unenroll member from campaign
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkDomainPermission } from "../../../../../../_lib/permissions";
import { forwardRequest } from "../../../../../../_lib/proxy-client";
import { handleError, ForbiddenError } from "../../../../../../_lib/errors";

interface RouteParams {
  params: Promise<{ id: string; memberId: string }>;
}

/**
 * POST /api/v1/campaigns/[id]/members/[memberId]/enroll
 *
 * Enroll a member in a campaign.
 * Requires org:campaigns:manage permission.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("campaigns", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage campaigns");
    }

    const { id, memberId } = await params;

    return forwardRequest(
      {
        method: "POST",
        path: `/v1/campaigns/${id}/members/${memberId}/enroll`,
      },
      {},
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/campaigns/[id]/members/[memberId]/enroll
 *
 * Unenroll a member from a campaign.
 * Requires org:campaigns:manage permission.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await checkDomainPermission("campaigns", "manage");
    if (!hasPermission) {
      throw new ForbiddenError("You don't have permission to manage campaigns");
    }

    const { id, memberId } = await params;

    return forwardRequest(
      {
        method: "DELETE",
        path: `/v1/campaigns/${id}/members/${memberId}/enroll`,
      },
      {},
      204
    );
  } catch (error) {
    return handleError(error);
  }
}
