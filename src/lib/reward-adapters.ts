/**
 * Reward Data Adapters
 *
 * Normalizes different provider reward formats into a unified structure
 */

import type { NormalizedReward } from "@/types/reward-selection";

// Actual API response structure (different from the type definition)
interface ApiCatalogItem {
  sourceIdentifier: string;
  brandName: string;
  productName: string;
  description: string;
  value_type?: string;
  value_min?: number;
  value_max?: number;
  faceValue?: number; // Fallback in case some use this
  currency: string;
  countries: string[];
  status: "active" | "inactive";
  imageUrl: string;
  sourceItem?: unknown;
  rawData?: Record<string, unknown>;
}

// Blackhawk Product type (from legacy API)
interface BlackhawkProduct {
  contentProviderCode: string;
  eGiftFormat: string;
  locale: string;
  logoImage: string;
  offFaceDiscountPercent: number;
  parentBrandName: string;
  productDescription: string;
  productImage: string;
  productName: string;
  redemptionInfo: string;
  termsAndConditions: {
    text: string;
    type: string;
  };
  valueRestrictions: {
    maximum: number;
    minimum: number;
  };
  cardExists?: boolean;
  associatedItems?: unknown[];
}

/**
 * Adapt unified catalog item format (Tremendous/Tango) to normalized reward
 */
export function adaptUnifiedCatalogItem(
  item: ApiCatalogItem,
  sourceId: string
): NormalizedReward {
  // Handle both API formats: value_min/value_max OR faceValue
  let minValue: number;
  let maxValue: number;
  let faceValue: number | undefined;

  if (item.value_min !== undefined && item.value_max !== undefined) {
    // API returns value_min and value_max
    minValue = item.value_min;
    maxValue = item.value_max;
    // If min = max, it's effectively a fixed value
    if (minValue === maxValue) {
      faceValue = minValue;
    }
  } else if (item.faceValue !== undefined) {
    // Fallback to faceValue if that's what's provided
    faceValue = item.faceValue;
    minValue = faceValue;
    maxValue = faceValue;
  } else {
    console.warn("adaptUnifiedCatalogItem: No value information found for item", item);
    minValue = 0;
    maxValue = 0;
  }

  return {
    sourceId,
    sourceIdentifier: item.sourceIdentifier || "",
    brandName: item.brandName || "",
    productName: item.productName || "",
    description: item.description || "",
    imageUrl: item.imageUrl || "",
    currency: item.currency || "USD",
    status: item.status || "active",
    minValue,
    maxValue,
    faceValue,
    countries: item.countries || [],
    rawData: item,
  };
}

/**
 * Adapt Blackhawk product format to normalized reward
 */
export function adaptBlackhawkProduct(
  product: BlackhawkProduct
): NormalizedReward {
  // Debug logging
  if (!product.valueRestrictions) {
    console.warn("adaptBlackhawkProduct: Missing valueRestrictions for product", product);
  }

  const minValue = product.valueRestrictions?.minimum ?? 0;
  const maxValue = product.valueRestrictions?.maximum ?? 0;

  return {
    sourceId: "source-blackhawk",
    sourceIdentifier: product.contentProviderCode || "",
    brandName: product.parentBrandName || "",
    productName: product.productName || "",
    description: product.productDescription || "",
    imageUrl: product.productImage || product.logoImage || "",
    currency: "USD", // Blackhawk is USD-only
    status: "active", // Blackhawk doesn't have explicit status field
    // For range-based rewards, use actual min/max
    minValue,
    maxValue,
    countries: ["US"], // Blackhawk is primarily US-centric
    rawData: product,
  };
}

/**
 * Main adapter function that routes to the correct adapter based on source ID
 */
export function normalizeReward(
  data: ApiCatalogItem | BlackhawkProduct,
  sourceId: string
): NormalizedReward {
  if (sourceId === "source-blackhawk") {
    return adaptBlackhawkProduct(data as BlackhawkProduct);
  }

  // Default to unified catalog item format (Tremendous, Tango, etc.)
  return adaptUnifiedCatalogItem(data as ApiCatalogItem, sourceId);
}
