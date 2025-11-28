import { NextRequest, NextResponse } from "next/server";
import { fetchEnrichedTangoCatalog, EnhancedTangoProduct } from "@/app/api/services/providers/fetch-tango-enriched";
import { fetchEnrichedBlackhawkProducts, EnhancedBlackhawkProduct } from "@/app/api/services/providers/fetch-blackhawk-enriched";
import { auth } from "@clerk/nextjs/server";

// Common interfaces for normalized data

// Combined product interface
interface CombinedProduct {
  id: string;
  provider: "tango" | "blackhawk";
  productName: string;
  brandName: string;
  description: string;
  imageUrl: string;
  minValue: number;
  maxValue: number;
  currency: string;
  cardExists: boolean;
  associatedItems: any[];
  rebatePercentage?: number;
  providerSpecific: EnhancedTangoProduct | EnhancedBlackhawkProduct;
}

/**
 * Normalizes a Tango product to the combined format
 */
function normalizeTangoProduct(product: EnhancedTangoProduct): CombinedProduct {
  return {
    id: product.productId,
    provider: "tango",
    productName: product.brandName,
    brandName: product.brandName,
    description: product.description,
    imageUrl: product.imageUrl,
    minValue: product.minAmount?.amount || 0,
    maxValue: product.maxAmount?.amount || 0,
    currency: product.minAmount?.currency || "USD",
    cardExists: product.cardExists || false,
    associatedItems: product.associatedItems || [],
    rebatePercentage: undefined, // Tango doesn't have a direct rebate percentage
    providerSpecific: product,
  };
}

/**
 * Normalizes a Blackhawk product to the combined format
 */
function normalizeBlackhawkProduct(product: EnhancedBlackhawkProduct): CombinedProduct {
  return {
    id: product.contentProviderCode,
    provider: "blackhawk",
    productName: product.productName || "",
    brandName: product.parentBrandName || "",
    description: product.productDescription || "",
    imageUrl: product.productImage || product.logoImage || "",
    minValue: product.valueRestrictions?.minimum || 0,
    maxValue: product.valueRestrictions?.maximum || 0,
    currency: "USD",
    cardExists: product.cardExists || false,
    associatedItems: product.associatedItems || [],
    rebatePercentage: Math.abs(product.offFaceDiscountPercent || 0),
    providerSpecific: product,
  };
}

/**
 * GET handler for combined catalog
 * Fetches and merges catalog data from both Tango and Blackhawk providers
 */
export async function GET(request: NextRequest) {
  try {


    const { has } = await auth();
  
    // Check for CP Ultra Admin permission
    const canAccessCPUltraAdmin = has({ permission: "org:cpadmin:access" });
    if (!canAccessCPUltraAdmin) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }


    // Fetch both catalogs in parallel using the shared services
    const [tangoProducts, blackhawkProducts] = await Promise.all([
      fetchEnrichedTangoCatalog(),
      fetchEnrichedBlackhawkProducts(),
    ]);

    // Normalize and combine the products
    const combinedProducts: CombinedProduct[] = [
      ...tangoProducts.map(normalizeTangoProduct),
      ...blackhawkProducts.map(normalizeBlackhawkProduct),
    ];

    // Sort by brand name and then by product name
    combinedProducts.sort((a, b) => {
      const brandCompare = a.brandName.localeCompare(b.brandName);
      if (brandCompare !== 0) return brandCompare;
      return a.productName.localeCompare(b.productName);
    });

    // Return the combined catalog
    return NextResponse.json({
      products: combinedProducts,
      metadata: {
        total: combinedProducts.length,
        tangoCount: tangoProducts.length,
        blackhawkCount: blackhawkProducts.length,
        enabledCount: combinedProducts.filter(p => p.cardExists).length,
      },
    });
  } catch (error) {
    console.error("Error processing combined catalog data:", error);

    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : "Failed to process combined catalog data";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
