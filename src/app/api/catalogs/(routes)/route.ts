import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllCatalogs } from "@/app/api/services/catalogs/get-all-catalogs";
import { db } from "@/utils/db";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { extractUserContext } from "../../_shared/types";

interface Catalog {
  client: {
    id: number;
    name: string;
  };
  id: number;
  name: string;
  created_date: string;
  items_total: number;
}

export async function GET() {
  try {
    const { has } = await auth();
    const canReadCatalogs = has({ permission: "org:catalogs:view" });
    if (!canReadCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const catalogs = await getAllCatalogs();

    return NextResponse.json(catalogs, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { has, userId, sessionClaims } = await auth();
    const canManageCatalogs = has({ permission: "org:catalogs:manage" });
    if (!canManageCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, client_id } = body;

    if (!name || !client_id) {
      return NextResponse.json(
        { error: "Name and client_id are required" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    // Create new catalog in redemption_registry_groups table
    const newCatalog = await db.redemption_registry_groups.create({
      data: {
        name: name,
        ent_id: Number(client_id),
        created_date: new Date(),
      },
      include: {
        enterprise: {
          select: {
            ent_id: true,
            ent_name: true,
          },
        },
      },
    });

    // Format response to match expected structure
    const formattedCatalog = {
      id: newCatalog.id,
      name: newCatalog.name || "",
      items_total: 0,
      client: {
        id: newCatalog.enterprise.ent_id,
        name: newCatalog.enterprise.ent_name || `Client ${newCatalog.enterprise.ent_id}`,
      },
      created_date: newCatalog.created_date
        ? newCatalog.created_date.toISOString()
        : "",
    };

    // Prepare metadata with user info and catalog creation details
    const metadata: Record<string, any> = {
      catalog: {
        catalog_id: newCatalog.id,
        catalog_name: newCatalog.name,
        enterprise_id: newCatalog.enterprise.ent_id,
        enterprise_name: newCatalog.enterprise.ent_name,
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

    // Log activity
    await logActivity(
      "catalog.create",
      `Catalog "${newCatalog.name}" was created`,
      {
        severity: "info",
        meta_data: metadata,
        enterprise_id: newCatalog.enterprise.ent_id,
      }
    );

    return NextResponse.json(formattedCatalog, { status: 201 });
  } catch (error) {
    console.error("Error creating catalog:", error);
    return NextResponse.json(
      { error: "Failed to create catalog" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { has, userId, sessionClaims } = await auth();
    const canManageCatalogs = has({ permission: "org:catalogs:manage" });
    if (!canManageCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, client_id } = body;

    if (!id || !name || !client_id) {
      return NextResponse.json(
        { error: "ID, name, and client_id are required" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    // Update catalog in redemption_registry_groups table
    const updatedCatalog = await db.redemption_registry_groups.update({
      where: { id: Number(id) },
      data: {
        name: name,
        ent_id: Number(client_id),
      },
      include: {
        enterprise: {
          select: {
            ent_id: true,
            ent_name: true,
          },
        },
        redemption_registries: {
          select: {
            id: true,
          },
        },
      },
    });

    // Format response to match expected structure
    const formattedCatalog = {
      id: updatedCatalog.id,
      name: updatedCatalog.name || "",
      items_total: updatedCatalog.redemption_registries.length,
      client: {
        id: updatedCatalog.enterprise.ent_id,
        name: updatedCatalog.enterprise.ent_name || `Client ${updatedCatalog.enterprise.ent_id}`,
      },
      created_date: updatedCatalog.created_date
        ? updatedCatalog.created_date.toISOString()
        : "",
    };

    // Prepare metadata with user info and catalog update details
    const metadata: Record<string, any> = {
      catalog: {
        catalog_id: updatedCatalog.id,
        catalog_name: updatedCatalog.name,
        enterprise_id: updatedCatalog.enterprise.ent_id,
        enterprise_name: updatedCatalog.enterprise.ent_name,
        updated_fields: Object.keys(body).filter((key) => key !== "id"),
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

    // Log activity
    await logActivity(
      "catalog.update",
      `Catalog "${updatedCatalog.name}" was updated`,
      {
        severity: "info",
        meta_data: metadata,
        enterprise_id: updatedCatalog.enterprise.ent_id,
      }
    );

    return NextResponse.json(formattedCatalog, { status: 200 });
  } catch (error) {
    console.error("Error updating catalog:", error);
    return NextResponse.json(
      { error: "Failed to update catalog" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { has, userId, sessionClaims } = await auth();
    const canManageCatalogs = has({ permission: "org:catalogs:manage" });
    if (!canManageCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, client_id, source_catalog_id } = body;

    if (!name || !client_id || !source_catalog_id) {
      return NextResponse.json(
        { error: "Name, client_id, and source_catalog_id are required" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    // Verify source catalog exists
    const sourceCatalog = await db.redemption_registry_groups.findUnique({
      where: { id: Number(source_catalog_id) },
      include: {
        enterprise: {
          select: {
            ent_id: true,
            ent_name: true,
          },
        },
      },
    });

    if (!sourceCatalog) {
      return NextResponse.json(
        { error: "Source catalog not found" },
        { status: 404 }
      );
    }

    // Get all items from the source catalog
    const sourceItems = await db.redemption_registries.findMany({
      where: { registry_group_id: Number(source_catalog_id) },
    });

    // Get enterprise redemptions for the source catalog using raw SQL
    const enterpriseRedemptions = await db.$queryRaw<
      Array<{
        redemption_id: number;
        redemption_type: string | null;
        value: number | null;
        redem_value: number | null;
        display_order: number | null;
      }>
    >`
      SELECT redemption_id, redemption_type, value, redem_value, display_order
      FROM enterprise_redemptions
      WHERE catalog_id = ${Number(source_catalog_id)}
    `;

    // Create a map for quick lookup of enterprise redemptions
    const enterpriseRedemptionMap = new Map();
    enterpriseRedemptions.forEach((er) => {
      const key = `${er.redemption_id}-${er.redemption_type}`;
      enterpriseRedemptionMap.set(key, er);
    });

    // Start transaction to create new catalog and copy all items
    const result = await db.$transaction(async (tx) => {
      // Create new catalog
      const newCatalog = await tx.redemption_registry_groups.create({
        data: {
          name: name,
          ent_id: Number(client_id),
          created_date: new Date(),
        },
        include: {
          enterprise: {
            select: {
              ent_id: true,
              ent_name: true,
            },
          },
        },
      });

      // Copy all items from source catalog
      if (sourceItems.length > 0) {
        // Prepare redemption_registries data
        const registryInserts = sourceItems.map((item) => ({
          registry_group_id: newCatalog.id,
          redemption_id: item.redemption_id,
          redemption_type: item.redemption_type,
          display_order: item.display_order,
        }));

        // Insert redemption_registries
        await tx.redemption_registries.createMany({
          data: registryInserts,
        });

        // Prepare enterprise_redemptions data
        const enterpriseRedemptionInserts = sourceItems
          .map((item) => {
            const key = `${item.redemption_id}-${item.redemption_type}`;
            const enterpriseRedemption = enterpriseRedemptionMap.get(key);

            if (enterpriseRedemption && item.redemption_type) {
              return {
                entid: Number(client_id),
                redemption_id: item.redemption_id,
                redemption_type: item.redemption_type,
                value: enterpriseRedemption.value || 0,
                redem_value: enterpriseRedemption.redem_value || 0,
                display_order: enterpriseRedemption.display_order || 0,
                catalog_id: newCatalog.id,
              };
            }
            return null;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        // Insert enterprise_redemptions if any exist
        if (enterpriseRedemptionInserts.length > 0) {
          await tx.enterprise_redemptions.createMany({
            data: enterpriseRedemptionInserts,
          });
        }
      }

      return newCatalog;
    });

    // Format response to match expected structure
    const formattedCatalog = {
      id: result.id,
      name: result.name || "",
      items_total: sourceItems.length,
      client: {
        id: result.enterprise.ent_id,
        name: result.enterprise.ent_name || `Client ${result.enterprise.ent_id}`,
      },
      created_date: result.created_date
        ? result.created_date.toISOString()
        : "",
    };

    // Prepare metadata with user info and catalog copy details
    const metadata: Record<string, any> = {
      catalog: {
        catalog_id: result.id,
        catalog_name: result.name,
        source_catalog_id: sourceCatalog.id,
        source_catalog_name: sourceCatalog.name,
        enterprise_id: result.enterprise.ent_id,
        enterprise_name: result.enterprise.ent_name,
        items_copied: sourceItems.length,
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

    // Log activity
    await logActivity(
      "catalog.copy",
      `Catalog "${result.name}" was copied from "${sourceCatalog.name}" with ${sourceItems.length} items`,
      {
        severity: "info",
        meta_data: metadata,
        enterprise_id: result.enterprise.ent_id,
      }
    );

    return NextResponse.json(formattedCatalog, { status: 201 });
  } catch (error) {
    console.error("Error copying catalog:", error);
    return NextResponse.json(
      { error: "Failed to copy catalog" },
      { status: 500 }
    );
  }
}
