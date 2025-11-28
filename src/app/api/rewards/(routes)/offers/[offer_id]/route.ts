import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSingleOfferById } from "../../../services/get-single-offer-by-id";
import { updateSingleOffer, updateSingleOfferStatus } from "../../../services/update-single-offer";
import { db } from "@/utils/db";
import { offerCreateSchema, offerUpdateSchema } from "../offer-schema";
import { mapStatusToDbFields, validateStatusTransition, applyStatusMapping, type FrontendStatus } from "../utils";
import { extractUserContext } from "../../../../_shared/types";
import { OfferUpdateData } from "../../../types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offer_id: string }> }
) {
  try {
    // Check permissions
    const { has } = await auth();
    const canViewRewards = has({ permission: "org:rewards:view" });

    if (!canViewRewards) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Await the params as per Next.js new version
    const { offer_id } = await params;

    if (!offer_id) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    const offer = await getSingleOfferById(offer_id);

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Error in GET /api/rewards/offers/[offer_id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Await the params as per Next.js new version
    const { offer_id } = await params;

    if (!offer_id) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    // Convert to number if string
    const id = typeof offer_id === "string" ? parseInt(offer_id) : offer_id;

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid offer ID" }, { status: 400 });
    }

    // Parse the request body
    const bodyRaw = await request.json();

    const parseResult = offerUpdateSchema.safeParse(bodyRaw);
    if (!parseResult.success) {
      console.log(`[PUT /api/rewards/offers/${offer_id}] Validation failed:`, parseResult.error.flatten());
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const body = parseResult.data;

    // Build the update object dynamically based on what fields are provided
    const updateData: OfferUpdateData = {};

    // Variables to track status changes for logging
    let oldStatus: string | null = null;
    let newStatus: string | null = null;
    let statusChanged = false;
    let currentOfferCpid: string | null = null;

    /* ---------- Field mapping begins ---------- */
    if (body.cpidx !== undefined) updateData.cpid = body.cpidx;

    if (body.poynts !== undefined) updateData.redem_value = Number(body.poynts);
    if (body.title !== undefined) updateData.title = body.title;
    if (body.value !== undefined) updateData.value = body.value.toString();

    // Handle reward_status mapping (primary frontend field)
    if (body.reward_status !== undefined) {

      // Apply status mapping for standard status values
      if (body.reward_status === 'active' || body.reward_status === 'inactive' || body.reward_status === 'suspended') {
        // Get current offer to validate status transition
        const currentOffer = await getSingleOfferById(id);
        const currentStatus = currentOffer?.status as FrontendStatus | null;

        // Capture old status and CPID for logging
        oldStatus = currentStatus || 'unknown';
        newStatus = body.reward_status;
        statusChanged = oldStatus !== newStatus;
        currentOfferCpid = currentOffer?.cpid || null;

        // Validate status transition
        const validation = validateStatusTransition(body.reward_status as FrontendStatus, false);
        if (!validation.valid) {
          console.log(`[PUT /api/rewards/offers/${offer_id}] Status transition validation failed:`, validation.error);
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          );
        }

        // Apply status mapping
        applyStatusMapping(body.reward_status as FrontendStatus, updateData);

      } else {
        // Handle non-standard reward_status values (like "archived") without status mapping
        console.log(`[PUT /api/rewards/offers/${offer_id}] Non-standard reward_status, setting directly: ${body.reward_status}`);

        // Still need to fetch current status for logging non-standard status changes
        const currentOffer = await getSingleOfferById(id);
        oldStatus = currentOffer?.status || 'unknown';
        newStatus = body.reward_status;
        statusChanged = oldStatus !== newStatus;
        currentOfferCpid = currentOffer?.cpid || null;

        updateData.reward_status = body.reward_status;
      }
    } else if (body.status !== undefined) {
      // Fallback: handle unified status field (for future compatibility)
      console.log(`[PUT /api/rewards/offers/${offer_id}] Processing unified status field: ${body.status}`);

      // Fetch current status for logging
      const currentOffer = await getSingleOfferById(id);
      oldStatus = currentOffer?.status || 'unknown';
      newStatus = body.status;
      statusChanged = oldStatus !== newStatus;
      currentOfferCpid = currentOffer?.cpid || null;

      applyStatusMapping(body.status, updateData);
    }
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags.join(",") : body.tags;
    }
    if (body.brand_name !== undefined) updateData.brandName = body.brand_name;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl === "" ? null : body.imageUrl;
    if (body.reward_availability !== undefined) updateData.reward_availability = body.reward_availability;

    // Handle is_enabled parameter override (takes precedence over status mapping)
    if (body.is_enabled !== undefined) {
      console.log(`[PUT /api/rewards/offers/${offer_id}] is_enabled parameter override: ${body.is_enabled}`);
      console.log(`[PUT /api/rewards/offers/${offer_id}] Setting is_active to: ${body.is_enabled ? 1 : 0}`);
      updateData.is_active = body.is_enabled ? 1 : 0;
    }

    if (body.shortDescription !== undefined) updateData.shortDescription = decodeURIComponent(body.shortDescription);
    if (body.longDescription !== undefined) updateData.description = decodeURIComponent(body.longDescription);
    if (body.instructions !== undefined) updateData.instructions = decodeURIComponent(body.instructions);

    if (body.terms !== undefined) updateData.terms = decodeURIComponent(body.terms);
    if (body.disclaimer !== undefined) updateData.disclaimer = decodeURIComponent(body.disclaimer);

    if (body.language !== undefined) updateData.language = body.language;
    if (body.redemptionUrl !== undefined) updateData.redem_url = body.redemptionUrl;
    if (body.customId !== undefined) updateData.custom_id = body.customId;
    if (body.rebateValue !== undefined) updateData.rebate_value = body.rebateValue ? Number(body.rebateValue) : null;
    if (body.startDate !== undefined) updateData.startdate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.enddate = body.endDate ? new Date(body.endDate) : null;

    if (body.inventoryType !== undefined) {
      updateData.inventory_type = body.inventoryType;
      updateData.redem_code_type = body.inventoryType === "multiple" ? "multi" : "single";

      if (body.limitType === "unlimited") {
        updateData.inventory_remaining = -1;
        updateData.inventory_type = "unlimited";
      } else if (body.usageLimit !== undefined && body.usageLimit) {
        updateData.inventory_remaining = Number(body.usageLimit);
      } else {
        updateData.inventory_remaining = body.inventoryType === "single" ? 1 : 0;
      }
    }
    if (body.usageLimit !== undefined && body.limitType !== "unlimited") {
      updateData.inventory_remaining = Number(body.usageLimit);
    }
    /* ---------- Field mapping ends ------------ */

    // Handle redemption codes
    const shouldUpdateCodes = body.singleCode !== undefined || body.multipleCodes !== undefined;
    const codesToInsert: string[] = [];
    if (shouldUpdateCodes) {
      if (body.singleCode && body.singleCode.trim()) {
        const cleanCode = body.singleCode.replace(/[\r\n]/g, "").trim();
        if (cleanCode) codesToInsert.push(cleanCode);
      }
      if (body.multipleCodes) {
        const multipleCodes = body.multipleCodes
          .split("\n")
          .map((c: string) => c.replace(/[\r\n]/g, "").trim())
          .filter(Boolean);
        codesToInsert.push(...multipleCodes);
      }
    }

    if (Object.keys(updateData).length === 0 && !shouldUpdateCodes) {
      console.log(`[PUT /api/rewards/offers/${offer_id}] No valid fields provided for update`);
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date();
    console.log(`[PUT /api/rewards/offers/${offer_id}] Should update codes:`, shouldUpdateCodes);

    // Execute the updates
    try {
      // If there are fields to update (excluding codes)
      if (Object.keys(updateData).length > 0) {
        console.log(`[PUT /api/rewards/offers/${offer_id}] Update data:`, JSON.stringify(updateData, null, 2));

        // Use the appropriate service function based on whether it's a status change
        if (statusChanged && oldStatus && newStatus) {
          // Use the status-specific function for better logging
          await updateSingleOfferStatus(
            id,
            newStatus,
            oldStatus,
            currentOfferCpid || undefined,
            userContext
          );
        } else {
          // Use the general update function
          await updateSingleOffer(id, updateData, userContext);
        }

        console.log(`[PUT /api/rewards/offers/${offer_id}] Offer updated successfully`);
      }

      // Handle redemption codes separately in a transaction
      if (shouldUpdateCodes) {
        await db.$transaction(async (tx) => {
          console.log(`[PUT /api/rewards/offers/${offer_id}] Deleting existing codes`);
          await tx.cp_redemptions_codes.deleteMany({
            where: { cp_redemptions_id: id, date_used: null },
          });

          if (codesToInsert.length > 0) {
            console.log(`[PUT /api/rewards/offers/${offer_id}] Inserting new codes:`, codesToInsert);
            await tx.cp_redemptions_codes.createMany({
              data: codesToInsert.map((code) => ({
                cp_redemptions_id: id,
                code,
                date_added: new Date(),
              })),
              skipDuplicates: true,
            });
          }
        });
      }
    } catch (error) {
      console.error(`[PUT /api/rewards/offers/${offer_id}] Update failed:`, error);
      throw error;
    }

    // Fetch the updated offer
    const updatedOffer = await getSingleOfferById(id);
    if (!updatedOffer) {
      return NextResponse.json(
        { error: "Offer not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Offer updated successfully",
      data: updatedOffer,
    });
  } catch (error) {
    console.error("Error in PUT /api/rewards/offers/[offer_id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ offer_id: string }> }
) {
  try {
    // Check permissions
    const { has } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse the request body
    const bodyRaw = await request.json();
    const parseResult = offerCreateSchema.safeParse(bodyRaw);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const body = parseResult.data;

    // Generate unique identifiers
    const redemType = `carepoynt1_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build the insert object
    const insertData: any = {
      is_deleted: 0,
      is_active: body.is_enabled !== undefined ? (body.is_enabled ? 1 : 0) : 1,
      status: 1,
      entid: 1,
      voucher_type_id: 1,
      redem_code_type: body.inventoryType === "multiple" ? "multi" : "single",
      redem_type: redemType,
      redem_code: "abc123", // legacy placeholder
      fielo_promo_id: "abc123", // legacy placeholder
      created_at: new Date(),
      updated_at: new Date(),
    };

    /* ---------- Field mapping begins ---------- */
    if (body.cpidx !== undefined && body.cpidx !== "") insertData.cpid = body.cpidx;
    if (body.poynts !== undefined) insertData.redem_value = Number(body.poynts);
    if (body.title !== undefined) insertData.title = body.title;
    if (body.value !== undefined) insertData.value = body.value.toString();

    // Handle reward_status mapping (primary frontend field)
    if (body.reward_status !== undefined) {
      // Apply status mapping for standard status values (suspended not allowed on creation)
      if (body.reward_status === 'active' || body.reward_status === 'inactive') {
        // Validate status transition for creation
        const validation = validateStatusTransition(body.reward_status as FrontendStatus, true);
        if (!validation.valid) {
          console.log(`[POST /api/rewards/offers] Status validation failed:`, validation.error);
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          );
        }

        // Apply status mapping
        const statusMapping = mapStatusToDbFields(body.reward_status as FrontendStatus);
        Object.assign(insertData, statusMapping);

      } else if (body.reward_status === 'suspended') {
        return NextResponse.json(
          { error: "Status 'suspended' can only be set after offer creation, not during creation" },
          { status: 400 }
        );
      } else {
        // Handle non-standard reward_status values
        insertData.reward_status = body.reward_status;
      }
    } else if (body.status !== undefined) {
      // Fallback: handle unified status field (for future compatibility)
      const statusMapping = mapStatusToDbFields(body.status);
      Object.assign(insertData, statusMapping);
    } else {
      // Default to active if no status provided
      insertData.reward_status = "active";
      insertData.is_deleted = 0;
      insertData.is_active = 1;
    }

    // Handle is_enabled parameter override (takes precedence over status mapping)
    if (body.is_enabled !== undefined) {
      insertData.is_active = body.is_enabled ? 1 : 0;
    }

    if (body.tags !== undefined) {
      insertData.tags = Array.isArray(body.tags) ? body.tags.join(",") : body.tags;
    }
    if (body.brand_name !== undefined) insertData.brandName = body.brand_name;
    if (body.imageUrl !== undefined) insertData.imageUrl = body.imageUrl;

    // Handle reward_availability
    insertData.reward_availability = body.reward_availability ?? "AVAILABLE";

    if (body.shortDescription !== undefined) insertData.shortDescription = decodeURIComponent(body.shortDescription);
    if (body.longDescription !== undefined) insertData.description = decodeURIComponent(body.longDescription);
    if (body.instructions !== undefined) insertData.instructions = decodeURIComponent(body.instructions);

    if (body.terms !== undefined) insertData.terms = decodeURIComponent(body.terms);
    if (body.disclaimer !== undefined) insertData.disclaimer = decodeURIComponent(body.disclaimer);

    if (body.language !== undefined) insertData.language = body.language;
    if (body.redemptionUrl !== undefined) insertData.redem_url = body.redemptionUrl;
    if (body.customId !== undefined) insertData.custom_id = body.customId;
    if (body.rebateValue !== undefined)
      insertData.rebate_value = body.rebateValue ? Number(body.rebateValue) : null;
    if (body.startDate !== undefined)
      insertData.startdate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined)
      insertData.enddate = body.endDate ? new Date(body.endDate) : null;

    if (body.inventoryType !== undefined) {
      insertData.inventory_type = body.inventoryType;
    } else {
      insertData.inventory_type = "single";
    }

    if (body.limitType === "unlimited") {
      insertData.inventory_remaining = -1;
      insertData.inventory_type = "unlimited";
    } else if (body.usageLimit !== undefined && body.usageLimit) {
      insertData.inventory_remaining = Number(body.usageLimit);
    } else {
      insertData.inventory_remaining = body.inventoryType === "single" ? 1 : 0;
    }
    /* ---------- Field mapping ends ------------ */

    // Handle redemption codes
    const codesToInsert: string[] = [];
    if (body.singleCode && body.singleCode.trim()) {
      const cleanCode = body.singleCode.replace(/[\r\n]/g, "").trim();
      if (cleanCode) codesToInsert.push(cleanCode);
    }
    if (body.multipleCodes) {
      const multipleCodes = body.multipleCodes
        .split("\n")
        .map((c: string) => c.replace(/[\r\n]/g, "").trim())
        .filter(Boolean);
      codesToInsert.push(...multipleCodes);
    }

    // Perform creation inside a transaction
    const createdOffer = await db.$transaction(async (tx) => {
      const newOffer = await tx.cp_redemptions.create({ data: insertData });

      if (codesToInsert.length > 0) {
        await tx.cp_redemptions_codes.createMany({
          data: codesToInsert.map((code) => ({
            cp_redemptions_id: newOffer.id,
            code,
            date_added: new Date(),
          })),
          skipDuplicates: true,
        });
      }

      return newOffer;
    });

    // Fetch full offer (in case service formats it)
    const fullOffer = await getSingleOfferById(createdOffer.id);

    return NextResponse.json(
      {
        success: true,
        message: "Offer created successfully",
        data: fullOffer ?? createdOffer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/rewards/offers/[offer_id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
