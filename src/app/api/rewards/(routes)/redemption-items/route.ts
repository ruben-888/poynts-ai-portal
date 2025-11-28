import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { updateSingleRedemptionItemStatus } from "../../services/update-single-redemption-item";
import { auth } from "@clerk/nextjs/server";
import { extractUserContext } from "../../../_shared/types";

export async function PUT(request: NextRequest) {
  try {
    const { has, userId, sessionClaims } = await auth();

    // Get the giftcard_id from the URL params
    const searchParams = request.nextUrl.searchParams;
    const giftcardId = searchParams.get("id");

    if (!giftcardId || isNaN(Number(giftcardId))) {
      return NextResponse.json(
        { error: "Valid giftcard ID is required" },
        { status: 400 }
      );
    }

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    // Parse request body to get the new status and cpidx
    const body = await request.json();
    const { status, cpidx } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // First check if user has full management permission
    if (has({ permission: "org:rewards:manage" })) {
      // User with management permission can perform any status change
    }
    // If not, check specific permissions based on status
    else if (
      status === "suspended" &&
      !has({ permission: "org:reward:suspend" })
    ) {
      return NextResponse.json(
        { error: "You don't have permission to suspend rewards" },
        { status: 403 }
      );
    } else if (
      status === "active" &&
      !has({ permission: "org:reward:unsuspend" })
    ) {
      return NextResponse.json(
        { error: "You don't have permission to activate rewards" },
        { status: 403 }
      );
    }

    // Use cpidx for logging if available
    const identifier = cpidx || giftcardId;

    // First, query to get the parent item_id from the redemption_giftcards table
    const giftcard = await db.redemption_giftcards.findUnique({
      where: { giftcard_id: Number(giftcardId) },
      select: { item_id: true },
    });

    if (!giftcard) {
      return NextResponse.json(
        { error: "Giftcard not found" },
        { status: 404 }
      );
    }

    const itemId = giftcard.item_id;

    // Get the current item to retrieve the old status
    const currentItem = await db.redemption_giftcard_items.findUnique({
      where: { item_id: itemId },
      select: { reward_status: true },
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: "Redemption item not found" },
        { status: 404 }
      );
    }

    // Update the item status using the parent item_id
    const updatedItem = await updateSingleRedemptionItemStatus(
      itemId,
      status,
      currentItem.reward_status || "unknown",
      identifier, // Pass the CPIDX or ID for logging
      userContext // Pass user context for activity logging
    );

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("Error updating redemption item status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update redemption item status" },
      { status: 500 }
    );
  }
}
