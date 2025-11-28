import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

const removeUserSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Get the current user's organization and permissions
    const { orgId, has } = await auth();
    const canAccessCPUltraAdmin = has({ permission: "org:cpadmin:access" });
    
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = removeUserSchema.parse(body);
    
    const { userId, organizationId } = validatedData;

    // Authorization check
    if (!canAccessCPUltraAdmin) {
      // Regular users can only remove users from their own organization
      if (!orgId) {
        return NextResponse.json(
          { error: "No organization context found" },
          { status: 403 }
        );
      }
      
      if (organizationId !== orgId) {
        return NextResponse.json(
          { error: "You can only remove users from your own organization" },
          { status: 403 }
        );
      }
    }

    // Get the organization membership list to find the membership ID
    const organizationMemberships = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId,
    });
    
    // Find the membership for the specific user
    const membership = organizationMemberships.data.find(
      (mem) => mem.publicUserData?.userId === userId
    );

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 404 }
      );
    }

    // Remove the user from the organization
    await clerkClient.organizations.deleteOrganizationMembership({
      organizationId,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: "User removed from organization successfully",
      data: {
        userId,
        organizationId,
      },
    });
  } catch (error) {
    console.error("Error removing user from organization:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Handle specific Clerk errors
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "User or organization not found" },
          { status: 404 }
        );
      }
      
      if (error.message.includes("last admin")) {
        return NextResponse.json(
          { error: "Cannot remove the last admin from the organization" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to remove user from organization" },
      { status: 500 }
    );
  }
}