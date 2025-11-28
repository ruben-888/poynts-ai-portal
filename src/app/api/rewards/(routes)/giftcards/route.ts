import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createGiftCard } from "../../services/manage-giftcard";
import { extractUserContext } from "../../../_shared/types";
import { createGiftCardSchema } from "./schema";

export async function POST(request: NextRequest) {
  try {
    // Check permissions
    const { has, userId, sessionClaims } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user context for activity logging
    const userContext = extractUserContext(userId, sessionClaims);
    
    if (!userContext) {
      return NextResponse.json({ error: "Unable to extract user context" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createGiftCardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Auto-enable the gift card for tenant_id 8 (customer portal)
    const giftCardData = {
      ...data,
      auto_enable_tenant_id: 8,
    };

    // Create the gift card
    console.log("Creating gift card with data:", {
      brand_id: giftCardData.brand_id,
      value: giftCardData.value,
      poynts: giftCardData.poynts,
      auto_enable_tenant_id: giftCardData.auto_enable_tenant_id
    });
    
    const result = await createGiftCard(giftCardData, userContext);
    
    // Handle validation errors
    if (!result.success) {
      if (result.validationErrors) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            validationErrors: result.validationErrors,
          },
          { status: 400 }
        );
      }
      // Handle other errors
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to create gift card",
        },
        { status: 500 }
      );
    }
    
    console.log("Gift card created successfully:", result.data.giftcard_id);

    return NextResponse.json(
      {
        success: true,
        message: "Gift card created successfully",
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating gift card:", error);
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      // Provide more detailed error message for debugging
      return NextResponse.json({ 
        error: error.message,
        details: "Gift card creation failed. Check server logs for details."
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create gift card", details: "Unknown error occurred" },
      { status: 500 }
    );
  }
}