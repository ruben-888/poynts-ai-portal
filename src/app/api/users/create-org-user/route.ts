import { NextRequest, NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["org:basic", "org:rewards_admin", "org:super_admin"]),
  organizationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get the current user's organization and permissions
    const { orgId, has } = await auth();
    const canAccessCPUltraAdmin = has({ permission: "org:cpadmin:access" });
    
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);
    
    const { firstName, lastName, email, role, organizationId } = validatedData;

    // Determine which organization to add the user to
    let targetOrgId: string;
    
    if (canAccessCPUltraAdmin) {
      // CP Ultra Admin can specify any organization
      if (organizationId) {
        targetOrgId = organizationId;
      } else if (orgId) {
        // If no org specified, use current org
        targetOrgId = orgId;
      } else {
        return NextResponse.json(
          { error: "Organization ID is required" },
          { status: 400 }
        );
      }
    } else {
      // Regular users can only add to their own organization
      if (!orgId) {
        return NextResponse.json(
          { error: "No organization context found" },
          { status: 403 }
        );
      }
      
      // If organizationId is provided, it must match the user's current org
      if (organizationId && organizationId !== orgId) {
        return NextResponse.json(
          { error: "You can only add users to your own organization" },
          { status: 403 }
        );
      }
      
      targetOrgId = orgId;
    }

    // Initialize Clerk client to perform user and organization operations
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Check if user already exists in Clerk
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    let userId: string;

    if (existingUsers.totalCount > 0) {
      // User already exists in Clerk
      userId = existingUsers.data[0].id;
      
      // Check if user is already in the target organization
      const organizationMemberships = await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: targetOrgId,
      });
      
      const isAlreadyMember = organizationMemberships.data.some(
        (membership) => membership.publicUserData?.userId === userId
      );

      if (isAlreadyMember) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 400 }
        );
      }
    } else {
      // Create new user in Clerk
      const newUser = await clerkClient.users.createUser({
        emailAddress: [email],
        firstName,
        lastName,
        skipPasswordChecks: true,
        skipPasswordRequirement: true,
      });
      
      userId = newUser.id;
    }

    // Add user to organization with specified role
    const membership = await clerkClient.organizations.createOrganizationMembership({
      organizationId: targetOrgId,
      userId,
      role,
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        membershipId: membership.id,
        role: membership.role,
        organizationId: targetOrgId,
      },
    });
  } catch (error) {
    console.error("Error creating/adding user to organization:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Check for Clerk-specific errors
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          { error: "User already exists in organization" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
