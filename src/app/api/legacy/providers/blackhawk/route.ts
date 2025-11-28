import { NextResponse } from "next/server";
import { fetchEnrichedBlackhawkCatalog } from "@/app/api/services/providers/fetch-blackhawk-enriched";
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

// Define interface for Blackhawk product
interface BlackhawkProduct {
  contentProviderCode: string;
  eGiftFormat?: string;
  locale?: string;
  logoImage?: string;
  offFaceDiscountPercent?: number;
  parentBrandName?: string;
  productDescription?: string;
  productImage?: string;
  productName?: string;
  redemptionInfo?: string;
  termsAndConditions?: {
    text: string;
    type: string;
  };
  valueRestrictions?: {
    exclusivelyAllowedValues?: number[];
    maximum?: number;
    minimum?: number;
  };
  [key: string]: any; // Allow for additional properties
}

// Enhanced product with our cardExists field and associated items
interface EnhancedProduct extends BlackhawkProduct {
  cardExists: boolean;
  associatedItems: AssociatedItem[];
}

/**
 * GET handler for Blackhawk API proxy
 * Fetches gift card catalog data from Blackhawk service using POST request
 * and compares it with our database records to validate card existence
 */
export async function GET() {
  try {

    const { has } = await auth();

    // Check for CP Ultra Admin permission
    if (!has({ permission: "org:cpadmin:access" })) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }

    // Fetch enriched Blackhawk catalog using the shared service
    const blackhawkData = await fetchEnrichedBlackhawkCatalog();

    // Return the enhanced data
    return NextResponse.json(blackhawkData);
  } catch (error) {
    console.error("Error processing Blackhawk API data:", error);

    // Return appropriate error response
    return NextResponse.json(
      { error: "Failed to process Blackhawk API data" },
      { status: 500 },
    );
  }
}
