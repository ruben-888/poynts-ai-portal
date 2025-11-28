import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { extractUserContext } from "../../../_shared/types";

export async function DELETE(
  request: Request,
  { params }: { params: { catalog_id: string } }
) {
  try {
    const { has, userId, sessionClaims } = await auth();
    const canManageCatalogs = has({ permission: "org:catalogs:manage" });
    if (!canManageCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { catalog_id } = params;

    if (!catalog_id) {
      return NextResponse.json(
        { error: "Catalog ID is required" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    // First, get the catalog details for logging
    const catalog = await db.redemption_registry_groups.findUnique({
      where: { id: Number(catalog_id) },
      select: {
        id: true,
        name: true,
        ent_id: true,
        deleted_date: true,
      },
    });

    if (!catalog) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    // Check if catalog is already deleted
    if (catalog.deleted_date) {
      return NextResponse.json(
        { error: "Catalog is already deleted" },
        { status: 400 }
      );
    }

    // Soft delete the catalog by setting deleted_date
    await db.redemption_registry_groups.update({
      where: { id: Number(catalog_id) },
      data: {
        deleted_date: new Date(),
      },
    });

    // Prepare metadata with user info and catalog deletion details
    const metadata: Record<string, any> = {
      catalog: {
        catalog_id: catalog.id,
        catalog_name: catalog.name,
        enterprise_id: catalog.ent_id,
      },
    };

    // Add user info to metadata if available
    if (userContext) {
      metadata.user = {
        userId: userContext.userId,
        userIdExternal: userContext.userIdExternal,
        actor: userContext.actor,
        firstName: userContext.firstName,
        lastName: userContext.lastName,
        fullName: userContext.fullName,
        primaryEmail: userContext.primaryEmail,
        orgRole: userContext.orgRole,
        orgName: userContext.orgName,
        orgSlug: userContext.orgSlug,
      };
    }

    // Log the activity
    await logActivity(
      "catalog.delete",
      `Catalog "${catalog.name}" was deleted`,
      {
        severity: "info",
        meta_data: metadata,
        enterprise_id: catalog.ent_id,
      }
    );

    return NextResponse.json({
      success: true,
      message: `Catalog "${catalog.name}" successfully deleted`,
    });
  } catch (error) {
    console.error("Error deleting catalog:", error);
    return NextResponse.json(
      { error: "Failed to delete catalog" },
      { status: 500 }
    );
  }
}
