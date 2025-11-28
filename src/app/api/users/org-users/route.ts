import { NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { ApiResponse } from "@/types/clerk";
import type {
  OrganizationMembershipPublicUserData,
  User,
  EmailAddress,
} from "@clerk/nextjs/server";

// Define the OrganizationMembership interface based on Clerk's API response
interface OrganizationMembership {
  id: string;
  role: string;
  publicMetadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  organizationId?: string;
  organizationName?: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    role: string;
    emailAddresses: Array<{
      id: string;
      emailAddress: string;
      verification: {
        status: string;
        strategy: string;
      } | null;
    }>;
    primaryEmailAddressId: string | null;
    lastSignInAt: number | null;
  };
}

export async function GET(request: Request) {
  try {
    // Check permissions
    const { has, orgId } = await auth();
    const canViewUsers = has({ permission: "org:users:view" });
    const canAccessCPUltraAdmin = has({ permission: "org:cpadmin:access" });

    if (!canViewUsers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    let memberships: any[] = [];

    if (canAccessCPUltraAdmin) {
      // CP Ultra Admin: Get users from all organizations
      // First get all organizations
      const { data: organizations } = await clerkClient.organizations.getOrganizationList({
        limit: 100, // Adjust as needed
      });

      // Get memberships from all organizations
      const allMemberships = await Promise.all(
        organizations.map(async (org) => {
          const { data: orgMemberships } = await clerkClient.organizations.getOrganizationMembershipList({
            organizationId: org.id,
          });
          return orgMemberships.map(membership => ({
            ...membership,
            organizationId: org.id,
            organizationName: org.name,
          }));
        })
      );

      memberships = allMemberships.flat();
    } else {
      // Regular user: Get users from current organization only
      if (!orgId) {
        return NextResponse.json(
          { error: "No organization context found" },
          { status: 400 }
        );
      }

      const { data: orgMemberships } = await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });
      memberships = orgMemberships.map(membership => ({
        ...membership,
        organizationId: orgId,
        organizationName: null, // We could fetch this if needed
      }));
    }

    // Get full user details for each membership
    const userIds = memberships
      .map((membership) => membership.publicUserData?.userId)
      .filter((id): id is string => id !== undefined);
    const { data: users } = await clerkClient.users.getUserList({
      userId: userIds,
    });

    // Transform the response to match our API format
    const formattedMemberships: OrganizationMembership[] = memberships.map(
      (membership) => {
        const publicData =
          membership.publicUserData as OrganizationMembershipPublicUserData;
        const fullUserData = users.find(
          (user: User) => user.id === publicData.userId
        );

        return {
          id: membership.id,
          role: membership.role,
          publicMetadata: membership.publicMetadata || {},
          createdAt: new Date(membership.createdAt).getTime(),
          updatedAt: new Date(membership.updatedAt).getTime(),
          organizationId: membership.organizationId,
          organizationName: membership.organizationName,
          user: {
            id: publicData.userId || "",
            firstName: publicData.firstName,
            lastName: publicData.lastName,
            imageUrl: publicData.imageUrl,
            role: membership.role,
            emailAddresses:
              fullUserData?.emailAddresses.map((email: EmailAddress) => ({
                id: email.id,
                emailAddress: email.emailAddress,
                verification: email.verification
                  ? {
                      status: email.verification.status,
                      strategy: email.verification.strategy,
                    }
                  : null,
              })) || [],
            primaryEmailAddressId: fullUserData?.primaryEmailAddressId || null,
            lastSignInAt: fullUserData?.lastSignInAt
              ? new Date(fullUserData.lastSignInAt).getTime()
              : null,
          },
        };
      }
    );

    // Return memberships list as JSON with the ApiResponse wrapper
    const response: ApiResponse<OrganizationMembership[]> = {
      data: formattedMemberships,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching organization users:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization users" },
      { status: 500 }
    );
  }
}
