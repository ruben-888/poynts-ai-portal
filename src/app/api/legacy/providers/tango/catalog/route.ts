import { NextRequest, NextResponse } from "next/server";
import { fetchEnrichedTangoCatalog } from "@/app/api/services/providers/fetch-tango-enriched";
import { auth } from "@clerk/nextjs/server";

// Interface for individual gift cards under each item
interface GiftCard {
  giftcard_id: string;
  reward_name: string;
  brand_name: string;
  cpidx: string;
  value: number;
  reward_status: string;
  rebate_provider_percentage?: number;
  rebate_base_percentage?: number;
  rebate_customer_percentage?: number;
  rebate_cp_percentage?: number;
}

// Interface for associated gift card items matching rewards-by-tenant format
interface AssociatedItem {
  redemption_id: string;
  cpid: string | null;
  cpidx: string | null;
  type: "giftcard";
  value: string;
  poynts: string;
  title: string;
  name: string | null;
  inventory_remaining: string;
  reward_status: "active" | "suspended" | "deleted";
  reward_availability: string;
  language: string;
  utid: string;
  value_type: string;
  tags?: string;
  priority: number;
  reward_image?: string;
  source_letter: string;
  item_id: number;
  brand_id: number;
  cards?: GiftCard[];
}

// Interface for Tango product from API
interface TangoProduct {
  productId: string;
  brandName: string;
  description: string;
  imageUrl: string;
  minAmount: {
    amount: number;
    currency: string;
  };
  maxAmount: {
    amount: number;
    currency: string;
  };
  terms: string;
}

// Enhanced product with our cardExists field and associated items
interface EnhancedTangoProduct extends TangoProduct {
  cardExists: boolean;
  associatedItems: AssociatedItem[];
}

/**
 * GET handler for Tango catalog
 * Fetches gift card catalog data from Tango API and merges with database records
 */
export async function GET(request: NextRequest) {
  try {
    const { has } = await auth();

    // Check for CP Ultra Admin permission
    if (!has({ permission: "org:cpadmin:access" })) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }
    // Fetch enriched Tango catalog using the shared service
    const enhancedProducts = await fetchEnrichedTangoCatalog();

    // Return the enhanced data in the same format as Tango API
    return NextResponse.json({
      products: enhancedProducts
    });
  } catch (error) {
    console.error("Error processing Tango catalog data:", error);

    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : "Failed to process Tango catalog data";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
