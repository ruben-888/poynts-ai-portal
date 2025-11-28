import { NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    // Check authentication and permissions
    const { userId: actorUserId, has, orgId } = await auth();
    
    if (!actorUserId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for CP Ultra Admin permission
    const canAccessCPUltraAdmin = has({ permission: "org:cpadmin:access" });
    if (!canAccessCPUltraAdmin) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    // Support both "targetUserId" (original) and "userId" (alias) in the request body
    const targetUserId: string | undefined = body.targetUserId ?? body.userId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId (or userId) is required" },
        { status: 400 }
      );
    }

    // Create Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Get current user's session claims to extract actor metadata
    const user = await clerkClient.users.getUser(actorUserId);
    const actorMetadata = user.publicMetadata || {};

    // Create actor token
    const actorToken = await clerkClient.actorTokens.create({
      userId: targetUserId,
      actor: {
        sub: actorUserId,
        ...actorMetadata
      }
    });

    return NextResponse.json({ data: actorToken });
  } catch (error) {
    console.error("Error creating actor token:", error);
    return NextResponse.json(
      { error: "Failed to create actor token" },
      { status: 500 }
    );
  }
}
