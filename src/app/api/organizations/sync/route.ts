import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { postgresDb } from "@/utils/postgres-db";

export async function POST() {
  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Fetch all organizations from Clerk
    const { data: clerkOrgs } = await clerkClient.organizations.getOrganizationList({
      limit: 100,
    });

    const syncedOrgs = [];

    // Upsert each organization to PostgreSQL
    for (const org of clerkOrgs) {
      const upsertedOrg = await postgresDb.organizations.upsert({
        where: { id: org.id },
        update: {
          name: org.name,
          auth_provider_org_id: org.id,
          updated_at: new Date(),
        },
        create: {
          id: org.id,
          name: org.name,
          auth_provider_org_id: org.id,
          status: "active",
        },
      });

      syncedOrgs.push({
        id: upsertedOrg.id,
        name: upsertedOrg.name,
      });
    }

    return NextResponse.json({
      data: {
        synced: syncedOrgs.length,
        organizations: syncedOrgs,
      },
    });
  } catch (error) {
    console.error("Error syncing organizations:", error);
    const message = error instanceof Error ? error.message : "Failed to sync organizations";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
