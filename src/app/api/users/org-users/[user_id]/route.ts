import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = await params;
    const { has, userId: currentUserId, orgId } = await auth();

    const canManageUsers = has({ permission: "org:users:manage" });
    if (!canManageUsers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!currentUserId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return new NextResponse("Role is required", { status: 400 });
    }

    // Check if user is trying to assign CP Ultra Admin role without proper permission
    if (role === "org:cp_ultra_admin") {
      const canAccessCPUltraAdmin = has({ permission: "org:cpadmin:access" });
      if (!canAccessCPUltraAdmin) {
        return NextResponse.json(
          { error: "Insufficient permissions to assign CP Ultra Admin role" },
          { status: 403 }
        );
      }
    }

    // Create Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const updatedMembership =
      await clerkClient.organizations.updateOrganizationMembership({
        organizationId: orgId,
        userId: user_id,
        role,
      });

    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error("Error updating organization membership:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
