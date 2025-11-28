import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { extractUserContext } from "../../../../_shared/types";

interface LegacyCatalogItem {
  item_id: string | bigint;
  redemption_id: string | bigint;
  cpid: string;
  title: string;
  priority: number;
  redemption_type: string;
  entid: string | bigint;
  ent_name: string;
  language: string;
  value: number | string | null;
  registry_points: number | string;
  redem_value: number | string | null;
  status: string;
  availability: string;
  inventory: number | string;
  inventory_type: string;
  tags: string | null;
  registry_rank: number | string | null;
  rank: number | string | null;
  imageUrlsJson?: string | null;
}

interface CatalogItem
  extends Omit<
    LegacyCatalogItem,
    | "item_id"
    | "entid"
    | "redemption_id"
    | "priority"
    | "tags"
    | "registry_points"
    | "redemption_type"
    | "cpid"
    | "rank"
    | "registry_rank"
    | "redem_value"
    | "value"
    | "imageUrlsJson"
  > {
  item_id: string;
  entid: string;
  reward_id: string;
  priority: number;
  tags: string | null;
  poynts_reward: number;
  reward_type: string;
  cpidx: string;
  cpid: string;
  rank: number;
  registry_rank: number;
  poynts_catalog: number;
  value: number;
  reward_image?: string;
  brand: string;
}

type Props = {
  params: {
    catalog_id: string;
  };
};

// Helper function to extract image URL from imageUrlsJson (reused from rewards endpoint)
function extractImageUrl(imageUrlsJson?: string | null): string | undefined {
  if (!imageUrlsJson) return undefined;

  try {
    const imageUrls = JSON.parse(imageUrlsJson);

    // Try to get 300w image first
    if (imageUrls["300w-326ppi"]) {
      return imageUrls["300w-326ppi"];
    }
    // If not available, find the largest image by width
    else {
      let largestWidth = 0;
      let selectedImage: string | undefined = undefined;

      Object.keys(imageUrls).forEach((key) => {
        // Extract width from key (format: "NNNw-326ppi")
        const match = key.match(/(\d+)w-/);
        if (match && match[1]) {
          const width = parseInt(match[1]);
          if (width > largestWidth) {
            largestWidth = width;
            selectedImage = imageUrls[key];
          }
        }
      });

      // If no width-based images found, just take the first one
      if (!selectedImage && Object.keys(imageUrls).length > 0) {
        selectedImage = imageUrls[Object.keys(imageUrls)[0]];
      }

      return selectedImage;
    }
  } catch (e) {
    console.warn(`Error parsing imageUrlsJson:`, e);
    return undefined;
  }
}

export async function GET(request: NextRequest, { params }: any) {
  try {
    const { has } = await auth();
    const canReadCatalogs = has({ permission: "org:catalogs:view" });
    if (!canReadCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { catalog_id } = await params;

    if (!catalog_id) {
      return NextResponse.json(
        { error: "Catalog ID is required" },
        { status: 400 }
      );
    }

    // Use raw SQL to replicate the complex UNION query
    const catalogItems = await db.$queryRaw<LegacyCatalogItem[]>`
      SELECT 
        rr.id AS item_id,
        cr.id AS redemption_id,
        cr.cpid,
        cr.title,
        1 AS priority,
        'offer' AS redemption_type,
        cr.entid,
        cr.brandName AS ent_name,
        cr.language,
        er.value,
        cr.redem_value AS registry_points,
        er.redem_value,
        cr.reward_status AS status,
        cr.reward_availability AS availability,
        cr.inventory_remaining AS inventory,
        cr.inventory_type,
        cr.tags,
        rr.display_order AS registry_rank,
        er.display_order AS rank,
        NULL AS imageUrlsJson
      FROM redemption_registries rr
      JOIN cp_redemptions cr ON rr.redemption_id = cr.id
      LEFT JOIN enterprise_redemptions er ON rr.redemption_id = er.redemption_id 
        AND rr.registry_group_id = er.catalog_id 
        AND rr.redemption_type = er.redemption_type
      WHERE rr.registry_group_id = ${parseInt(catalog_id)} 
        AND rr.redemption_type = 'offer'
      
      UNION
      
      SELECT 
        rr.id AS item_id,
        rg.giftcard_id AS redemption_id,
        rg.cpid,
        rgi.rewardName AS title,
        rg.priority,
        rr.redemption_type,
        rgi.brand_id AS entid,
        rgb.brandName AS ent_name,
        rg.language,
        er.value,
        rg.redem_value AS registry_points,
        er.redem_value,
        rgi.reward_status AS status,
        rgi.reward_availability AS availability,
        rg.inventory_remaining AS inventory,
        rg.inventory_type,
        rg.tags,
        rr.display_order AS registry_rank,
        er.display_order AS rank,
        rgb.imageUrls_json AS imageUrlsJson
      FROM redemption_registries rr
      JOIN redemption_giftcards rg ON rr.redemption_id = rg.giftcard_id
      JOIN redemption_giftcard_items rgi ON rg.item_id = rgi.item_id
      JOIN redemption_giftcard_brands rgb ON rgb.brand_id = rgi.brand_id
      LEFT JOIN enterprise_redemptions er ON rr.redemption_id = er.redemption_id 
        AND rr.registry_group_id = er.catalog_id 
        AND rr.redemption_type = er.redemption_type
      WHERE rr.registry_group_id = ${parseInt(catalog_id)} 
        AND rr.redemption_type = 'giftcard'
    `;

    // Transform the data with all the requested changes
    const transformedItems: CatalogItem[] = catalogItems.map((item) => {
      const {
        item_id,
        redemption_id,
        redemption_type,
        registry_points,
        tags,
        priority,
        cpid,
        rank,
        registry_rank,
        redem_value,
        value,
        entid,
        imageUrlsJson,
        ...rest
      } = item;

      // Split the CPID and take first 4 parts (0 to 3) to create the truncated version
      const cpidParts = cpid.split("-");
      const truncatedCpid = cpidParts.slice(0, 4).join("-");

      // Extract image URL from imageUrlsJson
      const reward_image = extractImageUrl(imageUrlsJson);

      // Helper function to safely convert to number
      const toNumber = (
        val: number | string | bigint | null | undefined
      ): number => {
        if (val === null || val === undefined) return 0;
        if (typeof val === "number") return val;
        if (typeof val === "bigint") return Number(val);
        if (typeof val === "string") {
          const trimmed = val.trim();
          return trimmed ? parseInt(trimmed, 10) : 0;
        }
        return 0;
      };

      // Helper function to safely convert IDs to strings
      const toString = (val: string | bigint): string => {
        if (typeof val === "bigint") return val.toString();
        return val;
      };

      return {
        ...rest,
        ent_name: rest.ent_name || "Unknown Brand",
        item_id: toString(item_id),
        entid: toString(entid),
        reward_id: toString(redemption_id),
        reward_type: redemption_type,
        priority: toNumber(priority),
        poynts_reward: toNumber(registry_points),
        tags: tags ? tags.toLowerCase() : null,
        cpidx: cpid,
        cpid: truncatedCpid,
        rank: toNumber(rank),
        registry_rank: toNumber(registry_rank),
        poynts_catalog: toNumber(redem_value),
        value: toNumber(value),
        reward_image,
        brand: rest.ent_name || "Unknown Brand",
      };
    });

    return NextResponse.json({ data: transformedItems });
  } catch (error) {
    console.error("Error fetching catalog items:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog items" },
      { status: 500 }
    );
  }
}

// Interface for the item payload from the frontend
interface AddItemPayload {
  cpid: string;
  item_id: string;
  reward_type: string;
  title: string;
  ent_name: string;
  language: string;
  value: number;
  poynts_reward: number;
  poynts_catalog: number;
  status: string;
  availability: string;
  inventory: number;
  inventory_type: string;
  rank: number;
  entid: number;
  registry_rank: number;
  cpidx: string;
  reward_id: number;
  priority: number;
  tags?: string | null;
  reward_image?: string;
}

// Interface for redemption_registries insert data
interface RegistryInsertData {
  registry_group_id: number;
  redemption_id: number;
  redemption_type: string;
  display_order: number;
}

// Interface for enterprise_redemptions insert data
interface EnterpriseRedemptionInsertData {
  entid: number;
  redemption_id: number;
  redemption_type: string;
  value: number;
  redem_value: number;
  display_order: number;
  catalog_id: number;
}

// Interface for tracking added items
interface AddedItemData {
  cpid: string;
  title: string;
  reward_type: string;
}

export async function POST(
  request: Request,
  { params }: { params: { catalog_id: string } }
) {
  try {
    const { has, userId, sessionClaims } = await auth();
    const canManageCatalogs = has({ permission: "org:catalogs:manage" });
    if (!canManageCatalogs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { catalog_id } = await params;

    if (!catalog_id) {
      return NextResponse.json(
        { error: "Catalog ID is required" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    const body = await request.json();
    const { items }: { items: AddItemPayload[] } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // First, verify the catalog exists and get its details
    const catalog = await db.redemption_registry_groups.findUnique({
      where: { id: Number(catalog_id) },
      select: {
        id: true,
        name: true,
        ent_id: true,
      },
    });

    if (!catalog) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    // Get the current max display_order for this catalog to ensure proper ordering
    const maxDisplayOrder = await db.redemption_registries.findFirst({
      where: { registry_group_id: Number(catalog_id) },
      orderBy: { display_order: "desc" },
      select: { display_order: true },
    });

    let nextDisplayOrder = (maxDisplayOrder?.display_order || 0) + 1;

    // Prepare data for batch insertion
    const registryInserts: RegistryInsertData[] = [];
    const enterpriseRedemptionInserts: EnterpriseRedemptionInsertData[] = [];
    const addedItems: AddedItemData[] = [];

    for (const item of items) {
      // Check if item already exists in this catalog
      const existingItem = await db.redemption_registries.findFirst({
        where: {
          registry_group_id: Number(catalog_id),
          redemption_id: Number(item.item_id),
          redemption_type: item.reward_type,
        },
      });

      if (existingItem) {
        console.warn(
          `Item ${item.cpid} already exists in catalog ${catalog_id}, skipping`
        );
        continue;
      }

      // Prepare redemption_registries insert
      registryInserts.push({
        registry_group_id: Number(catalog_id),
        redemption_id: Number(item.item_id),
        redemption_type: item.reward_type,
        display_order: nextDisplayOrder++,
      });

      // Prepare enterprise_redemptions insert
      enterpriseRedemptionInserts.push({
        entid: catalog.ent_id,
        redemption_id: Number(item.item_id),
        redemption_type: item.reward_type,
        value: item.value,
        redem_value: item.poynts_catalog,
        display_order: item.rank || 0,
        catalog_id: Number(catalog_id),
      });

      addedItems.push({
        cpid: item.cpid,
        title: item.title,
        reward_type: item.reward_type,
      });
    }

    if (registryInserts.length === 0) {
      return NextResponse.json(
        { error: "No new items to add - all items already exist in catalog" },
        { status: 400 }
      );
    }

    // Perform batch inserts using transactions
    await db.$transaction(async (tx) => {
      // Insert into redemption_registries
      await tx.redemption_registries.createMany({
        data: registryInserts,
      });

      // Insert into enterprise_redemptions
      await tx.enterprise_redemptions.createMany({
        data: enterpriseRedemptionInserts,
      });
    });

    // Prepare metadata with user info and catalog items details
    const metadata: Record<string, any> = {
      catalog: {
        catalog_id: catalog.id,
        catalog_name: catalog.name,
        enterprise_id: catalog.ent_id,
        items_added: addedItems.length,
        items: addedItems,
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
      "catalog.item.add",
      `Added ${addedItems.length} items to catalog "${catalog.name}"`,
      {
        severity: "info",
        meta_data: metadata,
        enterprise_id: catalog.ent_id,
      }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully added ${addedItems.length} items to catalog "${catalog.name}"`,
      data: {
        catalog_id: catalog.id,
        items_added: addedItems.length,
        items: addedItems,
      },
    });
  } catch (error) {
    console.error("Error adding items to catalog:", error);
    return NextResponse.json(
      { error: "Failed to add items to catalog" },
      { status: 500 }
    );
  }
}
