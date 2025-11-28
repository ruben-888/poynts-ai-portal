import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UpdateSingleGiftCard } from "../../../services/update-single-giftcard";
import { getSingleGiftCardById } from "../../../services/get-single-giftcard-by-id";
import { deleteGiftCard } from "../../../services/manage-giftcard";
import { extractUserContext } from "../../../../_shared/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ giftcard_id: string }> }
) {
  try {
    // Check permissions
    const { has } = await auth();
    const canViewRewards = has({ permission: "org:rewards:view" });

    if (!canViewRewards) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get giftcard_id from route params
    const { giftcard_id } = await params;
    const giftcardId = parseInt(giftcard_id);

    if (isNaN(giftcardId)) {
      return NextResponse.json(
        { error: "Invalid giftcard_id" },
        { status: 400 }
      );
    }

    // Get the gift card
    const giftcard = await getSingleGiftCardById(giftcardId);

    return NextResponse.json(giftcard);
  } catch (error) {
    console.error("Error fetching gift card:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to fetch gift card" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ giftcard_id: string }> }
) {
  try {
    // Check permissions
    const { has, userId, sessionClaims } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get giftcard_id from route params
    const { giftcard_id } = await params;
    const giftcardId = parseInt(giftcard_id);

    if (isNaN(giftcardId)) {
      return NextResponse.json(
        { error: "Invalid giftcard_id" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    // Parse request body
    const data = await request.json();

    // Check if user has CP admin permissions for rebate field updates
    const isCPAdmin = has({ permission: "org:cpadmin:access" });

    // Map incoming fields to database fields
    // Map cpidx to cpid if present (the database field is named cpid)
    if (data.cpidx) {
      data.cpid = data.cpidx;
      delete data.cpidx; // Remove cpidx to avoid any confusion
    }

    // Map poynts to redem_value if present
    if (data.poynts !== undefined) {
      data.redem_value = data.poynts;
      delete data.poynts; // Remove poynts to avoid any confusion
    }

    // Convert language to uppercase if present
    if (data.language) {
      data.language = data.language.toUpperCase();
    }

    // Handle percentage fields - only allow CP admins to update these
    if (isCPAdmin) {
      // Map percentage fields to the correct database field names
      if (data.provider_percentage !== undefined) {
        data.rebate_provider_percentage = parseFloat(data.provider_percentage) || null;
        delete data.provider_percentage;
      }
      if (data.base_percentage !== undefined) {
        data.rebate_base_percentage = parseFloat(data.base_percentage) || null;
        delete data.base_percentage;
      }
      if (data.customer_percentage !== undefined) {
        data.rebate_customer_percentage = parseFloat(data.customer_percentage) || null;
        delete data.customer_percentage;
      }
      if (data.cp_percentage !== undefined) {
        data.rebate_cp_percentage = parseFloat(data.cp_percentage) || null;
        delete data.cp_percentage;
      }
    } else {
      // Remove percentage fields if user is not CP admin
      delete data.provider_percentage;
      delete data.base_percentage;
      delete data.customer_percentage;
      delete data.cp_percentage;
      delete data.rebate_provider_percentage;
      delete data.rebate_base_percentage;
      delete data.rebate_customer_percentage;
      delete data.rebate_cp_percentage;
    }

    // Update the gift card
    const updatedGiftCard = await UpdateSingleGiftCard(
      giftcardId,
      data,
      userContext
    );

    return NextResponse.json(updatedGiftCard);
  } catch (error) {
    console.error("Error updating gift card:", error);

    // Handle specific errors
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update gift card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ giftcard_id: string }> }
) {
  try {
    // Check permissions
    const { has, userId, sessionClaims } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get giftcard_id from route params
    const { giftcard_id } = await params;
    const giftcardId = parseInt(giftcard_id);

    if (isNaN(giftcardId)) {
      return NextResponse.json(
        { error: "Invalid giftcard_id" },
        { status: 400 }
      );
    }

    // Extract user context for activity logging
    const userContext = extractUserContext(userId, sessionClaims);
    
    if (!userContext) {
      return NextResponse.json({ error: "Unable to extract user context" }, { status: 401 });
    }

    // Delete the gift card
    const result = await deleteGiftCard(giftcardId, userContext);

    if (!result.success) {
      if (result.error?.includes("not found")) {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Gift card deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting gift card:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to delete gift card" },
      { status: 500 }
    );
  }
}
