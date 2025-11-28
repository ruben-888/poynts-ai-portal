import { NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Check permissions
    const { has } = await auth();
    const canAccessCPUltraAdmin = has({ permission: "org:cpadmin:access" });

    if (!canAccessCPUltraAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - CP Ultra Admin access required" },
        { status: 403 }
      );
    }

    // Initialize Clerk client with secret key to access organization endpoints
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Get all organizations
    const { data: organizations } = await clerkClient.organizations.getOrganizationList({
      limit: 100, // Adjust as needed
    });

    // Map to a simpler structure
    const mappedOrganizations = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      createdAt: org.createdAt,
    }));

    return NextResponse.json({
      data: mappedOrganizations,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}
