import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { auth } from "@clerk/nextjs/server";
import { extractUserContext } from "../../../../../_shared/types";

/**
 * DELETE handler for removing a specific item from a catalog
 *
 * @param request - The incoming request object
 * @param params - Contains route parameters (catalog_id and item_id)
 * @returns NextResponse with success message or error
 */
export async function DELETE(
  request: Request,
  { params }: { params: { catalog_id: string; item_id: string } }
) {
  try {
    const { has, userId, sessionClaims } = await auth();
    const canManageCatalogs = has({ permission: "org:catalogs:manage" });
    if (!canManageCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { catalog_id, item_id } = await params;

    if (!catalog_id || !item_id) {
      return NextResponse.json(
        { error: "Catalog ID and Item ID are required" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    console.log(`Removing item ${item_id} from catalog ${catalog_id}`);

    // First, verify the item exists in the catalog and get its details
    const registryItem = await db.$queryRaw<
      Array<{
        redemption_id: bigint;
        redemption_type: string;
      }>
    >`
      SELECT redemption_id, redemption_type
      FROM redemption_registries
      WHERE id = ${parseInt(item_id)} AND registry_group_id = ${parseInt(catalog_id)}
    `;

    if (!registryItem || registryItem.length === 0) {
      return NextResponse.json(
        { error: "Item not found in catalog" },
        { status: 404 }
      );
    }

    const { redemption_id, redemption_type } = registryItem[0];

    // Get item details for logging based on redemption type
    let itemTitle = "Unknown Item";
    let catalogName = "Unknown Catalog";
    let enterpriseId: number | undefined;

    try {
      // Get catalog details
      const catalog = await db.redemption_registry_groups.findUnique({
        where: { id: parseInt(catalog_id) },
        select: {
          name: true,
          ent_id: true,
        },
      });

      if (catalog) {
        catalogName = catalog.name || "Unknown Catalog";
        enterpriseId = catalog.ent_id;
      }

      // Get item details based on redemption type
      if (redemption_type === "giftcard") {
        const giftcardDetails = await db.$queryRaw<
          Array<{
            title: string;
            brand_name: string;
          }>
        >`
          SELECT 
            rgi.rewardName AS title,
            rgb.brandName AS brand_name
          FROM redemption_giftcards rg
          JOIN redemption_giftcard_items rgi ON rg.item_id = rgi.item_id
          JOIN redemption_giftcard_brands rgb ON rgb.brand_id = rgi.brand_id
          WHERE rg.giftcard_id = ${redemption_id}
        `;

        if (giftcardDetails && giftcardDetails.length > 0) {
          const details = giftcardDetails[0];
          itemTitle =
            details.title || details.brand_name || "Unknown Gift Card";
        }
      } else if (redemption_type === "offer") {
        const offerDetails = await db.$queryRaw<
          Array<{
            title: string;
          }>
        >`
          SELECT title
          FROM cp_redemptions
          WHERE id = ${redemption_id}
        `;

        if (offerDetails && offerDetails.length > 0) {
          itemTitle = offerDetails[0].title || "Unknown Offer";
        }
      }
    } catch (error) {
      console.warn("Could not fetch item details for logging:", error);
    }

    // Use a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // 1. Remove the item from the catalog (redemption_registries)
      await tx.$executeRaw`
        DELETE FROM redemption_registries
        WHERE id = ${parseInt(item_id)} AND registry_group_id = ${parseInt(catalog_id)}
      `;

      // 2. Remove the enterprise-specific configuration (enterprise_redemptions)
      // This removes the catalog-specific pricing and ranking
      await tx.$executeRaw`
        DELETE FROM enterprise_redemptions
        WHERE redemption_id = ${redemption_id} 
          AND catalog_id = ${parseInt(catalog_id)} 
          AND redemption_type = ${redemption_type}
      `;
    });

    // Prepare metadata with user info and catalog item removal details
    const metadata: Record<string, any> = {
      catalog: {
        catalog_id: parseInt(catalog_id),
        catalog_name: catalogName,
        item_id: parseInt(item_id),
        item_title: itemTitle,
        redemption_id: redemption_id.toString(),
        redemption_type,
        enterprise_id: enterpriseId,
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
      "catalog.item.remove",
      `Item "${itemTitle}" was removed from catalog "${catalogName}"`,
      {
        severity: "info",
        meta_data: metadata,
        enterprise_id: enterpriseId,
        reward_id: parseInt(item_id),
        reward_type: redemption_type,
      }
    );

    console.log(
      `Successfully removed item ${item_id} (redemption_id: ${redemption_id}, type: ${redemption_type}) from catalog ${catalog_id}`
    );

    return NextResponse.json({
      success: true,
      message: `Item successfully removed from catalog`,
      data: {
        item_id,
        catalog_id,
        redemption_id: redemption_id.toString(),
        redemption_type,
      },
    });
  } catch (error) {
    console.error("Error removing item from catalog:", error);
    return NextResponse.json(
      { error: "Failed to remove item from catalog" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating catalog item properties (rank and/or catalog points)
 *
 * @param request - The incoming request object containing the updates
 * @param params - Contains route parameters (catalog_id and item_id)
 * @returns NextResponse with success message or error
 */
export async function PUT(
  request: Request,
  { params }: { params: { catalog_id: string; item_id: string } }
) {
  try {
    const { has, userId, sessionClaims } = await auth();
    const canManageCatalogs = has({ permission: "org:catalogs:manage" });
    if (!canManageCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { catalog_id, item_id } = await params;
    const body = await request.json();
    const { rank, poynts_catalog } = body;

    if (!catalog_id || !item_id) {
      return NextResponse.json(
        { error: "Catalog ID and Item ID are required" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    // Validate that at least one field is provided
    if (rank === undefined && poynts_catalog === undefined) {
      return NextResponse.json(
        { error: "At least one field (rank or poynts_catalog) is required" },
        { status: 400 }
      );
    }

    // Validate rank if provided
    if (rank !== undefined && (typeof rank !== "number" || rank < 0)) {
      return NextResponse.json(
        { error: "Rank must be a non-negative number" },
        { status: 400 }
      );
    }

    // Validate poynts_catalog if provided
    if (
      poynts_catalog !== undefined &&
      (typeof poynts_catalog !== "number" || poynts_catalog < 0)
    ) {
      return NextResponse.json(
        { error: "Catalog points must be a non-negative number" },
        { status: 400 }
      );
    }

    console.log(`Updating catalog item ${item_id} in catalog ${catalog_id}:`, {
      rank,
      poynts_catalog,
    });

    // First, get the redemption details from redemption_registries
    const registryItem = await db.$queryRaw<
      Array<{
        redemption_id: bigint;
        redemption_type: string;
      }>
    >`
      SELECT redemption_id, redemption_type
      FROM redemption_registries
      WHERE id = ${parseInt(item_id)} AND registry_group_id = ${parseInt(catalog_id)}
    `;

    if (!registryItem || registryItem.length === 0) {
      return NextResponse.json(
        { error: "Item not found in catalog" },
        { status: 404 }
      );
    }

    const { redemption_id, redemption_type } = registryItem[0];

    // Get item details for logging based on redemption type
    let itemTitle = "Unknown Item";
    let catalogName = "Unknown Catalog";
    let enterpriseId: number | undefined;

    try {
      // Get catalog details
      const catalog = await db.redemption_registry_groups.findUnique({
        where: { id: parseInt(catalog_id) },
        select: {
          name: true,
          ent_id: true,
        },
      });

      if (catalog) {
        catalogName = catalog.name || "Unknown Catalog";
        enterpriseId = catalog.ent_id;
      }

      // Get item details based on redemption type
      if (redemption_type === "giftcard") {
        const giftcardDetails = await db.$queryRaw<
          Array<{
            title: string;
            brand_name: string;
          }>
        >`
          SELECT 
            rgi.rewardName AS title,
            rgb.brandName AS brand_name
          FROM redemption_giftcards rg
          JOIN redemption_giftcard_items rgi ON rg.item_id = rgi.item_id
          JOIN redemption_giftcard_brands rgb ON rgb.brand_id = rgi.brand_id
          WHERE rg.giftcard_id = ${redemption_id}
        `;

        if (giftcardDetails && giftcardDetails.length > 0) {
          const details = giftcardDetails[0];
          itemTitle =
            details.title || details.brand_name || "Unknown Gift Card";
        }
      } else if (redemption_type === "offer") {
        const offerDetails = await db.$queryRaw<
          Array<{
            title: string;
          }>
        >`
          SELECT title
          FROM cp_redemptions
          WHERE id = ${redemption_id}
        `;

        if (offerDetails && offerDetails.length > 0) {
          itemTitle = offerDetails[0].title || "Unknown Offer";
        }
      }
    } catch (error) {
      console.warn("Could not fetch item details for logging:", error);
    }

    // Build the update object dynamically based on what fields are provided
    const updates: string[] = [];
    const values: any[] = [];

    if (rank !== undefined) {
      updates.push("display_order = ?");
      values.push(rank);
    }

    if (poynts_catalog !== undefined) {
      updates.push("redem_value = ?");
      values.push(poynts_catalog);
    }

    // Add the WHERE clause parameters
    values.push(redemption_id, parseInt(catalog_id), redemption_type);

    // Execute the update query
    await db.$executeRawUnsafe(
      `
      UPDATE enterprise_redemptions 
      SET ${updates.join(", ")}
      WHERE redemption_id = ? 
        AND catalog_id = ? 
        AND redemption_type = ?
    `,
      ...values
    );

    // Prepare update description for logging
    const updateDetails: string[] = [];
    if (rank !== undefined) {
      updateDetails.push(`rank to ${rank}`);
    }
    if (poynts_catalog !== undefined) {
      updateDetails.push(`catalog points to ${poynts_catalog}`);
    }

    // Prepare metadata with user info and catalog item update details
    const metadata: Record<string, any> = {
      catalog: {
        catalog_id: parseInt(catalog_id),
        catalog_name: catalogName,
        item_id: parseInt(item_id),
        item_title: itemTitle,
        redemption_id: redemption_id.toString(),
        redemption_type,
        enterprise_id: enterpriseId,
        updates: {
          ...(rank !== undefined && { rank }),
          ...(poynts_catalog !== undefined && { poynts_catalog }),
        },
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
      "catalog.item.update",
      `Item "${itemTitle}" in catalog "${catalogName}" was updated: ${updateDetails.join(", ")}`,
      {
        severity: "info",
        meta_data: metadata,
        enterprise_id: enterpriseId,
        reward_id: parseInt(item_id),
        reward_type: redemption_type,
      }
    );

    const updateSummary: any = {
      item_id,
      catalog_id,
    };

    if (rank !== undefined) {
      updateSummary.new_rank = rank;
    }

    if (poynts_catalog !== undefined) {
      updateSummary.new_poynts_catalog = poynts_catalog;
    }

    return NextResponse.json({
      success: true,
      message: `Catalog item updated successfully`,
      data: updateSummary,
    });
  } catch (error) {
    console.error("Error updating catalog item:", error);
    return NextResponse.json(
      { error: "Failed to update catalog item" },
      { status: 500 }
    );
  }
}
