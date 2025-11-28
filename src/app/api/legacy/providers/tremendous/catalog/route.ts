import { NextRequest, NextResponse } from "next/server";
import { fetchTremendousCatalog } from "@/app/api/services/providers/fetch-tremendous-catalog";
import { auth } from "@clerk/nextjs/server";

/**
 * GET handler for Tremendous catalog
 * Fetches gift card catalog data from Tremendous API
 * 
 * Query parameters:
 * - country: Country code (default: US)
 * - currency: Currency code (default: USD)
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
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get("country") || "US";
    const currency = searchParams.get("currency") || "USD";

    // Fetch catalog from Tremendous
    const catalogData = await fetchTremendousCatalog(country, currency);

    // Return the catalog data
    return NextResponse.json(catalogData);
  } catch (error) {
    console.error("Error fetching Tremendous catalog:", error);

    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch Tremendous catalog";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
