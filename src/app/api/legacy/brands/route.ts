import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/utils/db";

// Define types for the database schema
interface GiftCardBrand {
  brand_id: number;
  brandKey: string;
  brandTag: string | null;
  brandName: string | null;
  description: string | null;
  disclaimer: string | null;
  shortDescription: string | null;
  status: string | null;
  terms: string | null;
  imageUrls_json: string | null;
  createdDate: string | null;
  lastUpdateDate: string | null;
  json: string | null;
}

/**
 * GET /api/legacy/brands
 * Retrieves a list of gift card brands from the database
 * @param request - The incoming request object
 * @returns NextResponse containing gift card brands data or error message
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const brandKey = searchParams.get("brandKey");
    const brandName = searchParams.get("brandName");

    // Build where clause based on query parameters
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (brandKey) {
      whereClause.brandKey = brandKey;
    }

    if (brandName) {
      whereClause.brandName = {
        contains: brandName,
      };
    }

    // Fetch gift card brands
    const brands = await (db as any).redemption_giftcard_brands.findMany({
      where: whereClause,
      orderBy: {
        brandName: "asc",
      },
    });

    // Transform the data to a more friendly format
    const formattedBrands = brands.map((brand: any) => ({
      id: brand.brand_id,
      key: brand.brandKey,
      tag: brand.brandTag,
      name: brand.brandName,
      description: brand.description,
      disclaimer: brand.disclaimer,
      shortDescription: brand.shortDescription,
      status: brand.status,
      terms: brand.terms,
      imageUrls: brand.imageUrls_json ? JSON.parse(brand.imageUrls_json) : null,
      createdDate: brand.createdDate,
      lastUpdateDate: brand.lastUpdateDate,
      // Parse JSON field if it exists
      additionalData: brand.json ? JSON.parse(brand.json) : null,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedBrands,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fetching gift card brands:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gift card brands",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
