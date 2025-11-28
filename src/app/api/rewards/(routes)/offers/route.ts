import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { getSingleOfferById } from "../../services/get-single-offer-by-id";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { extractUserContext } from "../../../_shared/types";

// Helper function to get client for entity (following legacy logic)
async function getClientForEntity(entId: number): Promise<{ id: string; name: string } | null> {
  try {
    // First query: get client through enterprise relationship
    const result = await db.$queryRawUnsafe<Array<{ id: string; name: string }>>(
      `SELECT cp.id, cp.name 
       FROM cp_clients cp
       LEFT JOIN enterprise e ON e.ent_id_parent = cp.ent_id
       WHERE e.ent_id = ?`,
      entId
    );

    if (result && result.length > 0) {
      return result[0];
    }

    // Second query: get parent entity
    const parentResult = await db.$queryRawUnsafe<Array<{ ent_id_parent: number }>>(
      `SELECT ent_id_parent FROM enterprise WHERE ent_id = ?`,
      entId
    );

    if (parentResult && parentResult.length > 0) {
      const parentId = parentResult[0].ent_id_parent;

      // Special case: if ent_id is 1 and parent is 0
      if (entId === 1 && parentId === 0) {
        const directResult = await db.$queryRawUnsafe<Array<{ id: string; name: string }>>(
          `SELECT cp.id, cp.name FROM cp_clients cp WHERE cp.ent_id = ?`,
          entId
        );
        return directResult && directResult.length > 0 ? directResult[0] : null;
      }

      // Recursive call if parent exists
      if (parentId !== 0) {
        return getClientForEntity(parentId);
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting client for entity:", error);
    return null;
  }
}




export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ offer_id: string }> }
) {
  try {
    // Check permissions and get user context
    const { has, userId, sessionClaims } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract user context for activity logging
    const userContext = extractUserContext(userId, sessionClaims);

    // Parse the request body
    const body = await request.json();

    // Validate required fields for creation
    const requiredFields = ['title', 'brand_name', 'poynts', 'value', 'longDescription'];
    const missingFields = requiredFields.filter(field => {
      const value = body[field];
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique redemption type and fielo_promo_id like legacy code
    const redemType = `carepoynt1_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fieloPromoId = "abc123"; // Legacy placeholder
    const redemCode = "abc123"; // Legacy placeholder

    // Build the insert object with required and optional fields
    const insertData: any = {
      // Required fields - set defaults if not provided
      is_deleted: 0,
      is_active: body.is_enabled !== undefined ? (body.is_enabled ? 1 : 0) : 1, // Default to active
      status: 1, // Legacy compatibility - always set to 1
      entid: 1, // Default entity ID
      voucher_type_id: 1, // Default voucher type ID
      redem_code_type: body.inventoryType === 'multiple' ? 'multi' : 'single', // Map to legacy values
      redem_type: redemType, // Unique redemption type
      fielo_promo_id: fieloPromoId, // Legacy promotion ID
      redem_code: redemCode, // Legacy redemption code
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Handle CPIDx (stored as cpid in database)
    if (body.cpidx !== undefined && body.cpidx !== "") {
      insertData.cpid = body.cpidx;
    }

    // Handle fields from General tab
    if (body.poynts !== undefined) {
      insertData.redem_value = Number(body.poynts);
    }
    if (body.title !== undefined) {
      insertData.title = body.title;
    }
    if (body.value !== undefined) {
      insertData.value = body.value.toString();
    }
    if (body.reward_status !== undefined) {
      insertData.reward_status = body.reward_status;
    } else {
      // Set default status
      insertData.reward_status = 'active';
    }
    if (body.reward_availability !== undefined) {
      insertData.reward_availability = body.reward_availability;
    } else {
      // Set default availability to AVAILABLE
      insertData.reward_availability = 'AVAILABLE';
    }
    if (body.tags !== undefined) {
      // Handle tags array conversion to comma-separated string
      insertData.tags = Array.isArray(body.tags)
        ? body.tags.join(",")
        : body.tags;
    }
    if (body.brand_name !== undefined) {
      insertData.brandName = body.brand_name;
    }
    if (body.imageUrl !== undefined) {
      insertData.imageUrl = body.imageUrl;
    }

    // Handle fields from Content tab
    if (body.shortDescription !== undefined) {
      insertData.shortDescription = decodeURIComponent(body.shortDescription);
    }
    if (body.longDescription !== undefined) {
      insertData.description = decodeURIComponent(body.longDescription);
    }
    if (body.instructions !== undefined) {
      insertData.instructions = decodeURIComponent(body.instructions);
    }

    // Handle fields from Legal tab
    if (body.terms !== undefined) {
      insertData.terms = decodeURIComponent(body.terms);
    }
    if (body.disclaimer !== undefined) {
      insertData.disclaimer = decodeURIComponent(body.disclaimer);
    }

    // Handle fields from Details tab
    if (body.language !== undefined) {
      insertData.language = body.language;
    }
    if (body.redemptionUrl !== undefined) {
      insertData.redem_url = body.redemptionUrl;
    }
    if (body.customId !== undefined) {
      insertData.custom_id = body.customId;
    }
    if (body.rebateValue !== undefined) {
      insertData.rebate_value = body.rebateValue
        ? Number(body.rebateValue)
        : null;
    }
    if (body.startDate !== undefined) {
      insertData.startdate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.endDate !== undefined) {
      insertData.enddate = body.endDate ? new Date(body.endDate) : null;
    }

    // Handle fields from Inventory tab
    if (body.inventoryType !== undefined) {
      insertData.inventory_type = body.inventoryType;
    } else {
      // Set default inventory type
      insertData.inventory_type = 'single';
    }
    // Note: usageLimit is handled via inventory_remaining field above
    // Note: limitType is handled via inventory_type field above

    // Set inventory_remaining based on limit type (following legacy pattern)
    if (body.limitType === 'unlimited') {
      insertData.inventory_remaining = -1; // -1 indicates unlimited in legacy system
      insertData.inventory_type = 'unlimited'; // Override inventory_type when unlimited
    } else if (body.usageLimit !== undefined && body.usageLimit) {
      insertData.inventory_remaining = Number(body.usageLimit);
    } else {
      insertData.inventory_remaining = body.inventoryType === 'single' ? 1 : 0;
    }

    // Handle redemption codes - these will be inserted into cp_redemptions_codes table after offer creation
    const codesToInsert: string[] = [];

    if (body.singleCode && body.singleCode.trim()) {
      // Strip newlines and carriage returns like legacy code
      const cleanCode = body.singleCode.replace(/[\r\n]/g, '').trim();
      if (cleanCode) {
        codesToInsert.push(cleanCode);
      }
    }
    if (body.multipleCodes) {
      const multipleCodes = body.multipleCodes
        .split('\n')
        .map((code: string) => code.replace(/[\r\n]/g, '').trim()) // Strip newlines and carriage returns
        .filter(Boolean);
      codesToInsert.push(...multipleCodes);
    }

    // Build the SQL INSERT query dynamically
    const columns = Object.keys(insertData).join(", ");
    const placeholders = Object.keys(insertData).map(() => "?").join(", ");
    const values = Object.values(insertData);

    // Insert the new offer into the database
    const result = await db.$executeRawUnsafe(
      `INSERT INTO cp_redemptions (${columns}) VALUES (${placeholders})`,
      ...values
    );

    // Get the ID of the newly created offer
    // Note: This approach may vary depending on your database setup
    const newOfferId = await db.$queryRawUnsafe<[{ id: number | bigint }]>(
      `SELECT LAST_INSERT_ID() as id`
    );

    const createdOfferId = newOfferId[0]?.id;

    if (!createdOfferId) {
      return NextResponse.json(
        { error: "Failed to create offer" },
        { status: 500 }
      );
    }

    // Insert redemption codes if any
    if (codesToInsert.length > 0) {
      const codeValues = codesToInsert.map(code => `(?, ?, NOW())`).join(', ');
      const codeParams = codesToInsert.flatMap(code => [createdOfferId, code]);
      await db.$executeRawUnsafe(
        `INSERT IGNORE INTO cp_redemptions_codes (cp_redemptions_id, code, date_added) VALUES ${codeValues}`,
        ...codeParams
      );
    }

    // Get client details for the entity and register in tenant registry
    try {
      // Get client for entity (following legacy logic)
      const clientDetails = await getClientForEntity(Number(insertData.entid));

      if (clientDetails?.id) {
        // Register in tenant registry (hardcoded to tenant "8" like legacy)
        const tenantId = 8;
        await db.tenant_registry_redemptions.create({
          data: {
            tenant_id: tenantId,
            redemption_id: Number(createdOfferId),
            redemption_type: "offer"
          }
        });

        // Log activity
        const logMessage = `Offer "${insertData.title}" created`;
        await logActivity(
          "reward.create",
          logMessage,
          {
            severity: "info",
            reward_id: Number(createdOfferId),
            reward_type: "offer",
            meta_data: {
              offer: {
                id: Number(createdOfferId),
                title: insertData.title,
                brand_name: insertData.brandName,
                cpid: insertData.cpid,
                reward_status: insertData.reward_status,
                inventory_type: insertData.inventory_type,
                poynts: insertData.redem_value
              },
              user: userContext
            }
          }
        );
      }
    } catch (error) {
      console.warn("Warning: Could not register offer in tenant registry:", error);
      // Don't fail the entire request if registry/logging fails
    }

    // Do not fetch and return the full offer here. Just return success and the new ID.
    return NextResponse.json({
      success: true,
      id: Number(createdOfferId),
      message: "Offer created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/rewards/offers/[offer_id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
