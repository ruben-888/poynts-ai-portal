/**
 * Simplified Tango Card Provider Implementation
 * Currently only implements catalog retrieval functionality
 *
 * Required Environment Variables:
 * - TANGO_PLATFORM_NAME: Your platform name
 * - TANGO_API_KEY: Your Tango Card API key
 */

import { GiftCardProvider, ProviderConfig, CatalogResponse } from "../types";

// Types for Tango API responses
type TangoCatalogItem = {
  utid: string;
  currencyCode: string;
  status: string;
  valueType: string;
  rewardType: string;
  minValue: number;
  maxValue: number;
  faceValue?: number;
  description?: string;
  terms?: string;
  imageUrls: Record<string, string>;
};

type TangoBrand = {
  brandKey: string;
  brandName: string;
  description?: string;
  terms?: string;
  imageUrls: Record<string, string>;
  items: TangoCatalogItem[];
};

type TangoCatalogResponse = {
  brands: TangoBrand[];
};

/**
 * Helper function to get the best available image URL
 * Handles cases where urls might be undefined
 */
const getBestImageUrl = (urls?: Record<string, string>): string => {
  if (!urls) return "";
  return urls["600w"] || urls["300w"] || urls["200w"] || urls["100w"] || "";
};

/**
 * Creates a simplified Tango provider that only handles catalog retrieval
 */
export const createTangoProvider = (
  config: ProviderConfig,
): GiftCardProvider => {
  const platformName = process.env.TANGO_PLATFORM_NAME;
  const apiKey = process.env.TANGO_API_KEY;

  if (!platformName || !apiKey) {
    throw new Error(
      "Missing required environment variables: TANGO_PLATFORM_NAME and TANGO_API_KEY",
    );
  }

  const getCatalog = async (): Promise<CatalogResponse> => {
    const auth = Buffer.from(`${platformName}:${apiKey}`).toString("base64");

    const response = await fetch("https://api.tangocard.com/raas/v2/catalogs", {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${response.statusText}`);
    }

    const data: TangoCatalogResponse = await response.json();

    // Add some debug logging
    // console.log('First brand:', data.brands[0])

    const products = data.brands.flatMap((brand) =>
      brand.items
        .filter((item) => item.status === "active")
        .map((item) => ({
          productId: item.utid,
          brandName: brand.brandName,
          description: item.description || brand.description || "",
          imageUrl:
            getBestImageUrl(item.imageUrls) || getBestImageUrl(brand.imageUrls),
          minAmount: {
            amount: item.minValue,
            currency: item.currencyCode,
          },
          maxAmount: {
            amount: item.maxValue,
            currency: item.currencyCode,
          },
          terms: item.terms || brand.terms || "",
        })),
    );

    return { products };
  };

  // Stub out other required methods
  const purchaseGiftCard = async () => {
    throw new Error("Purchase functionality not implemented");
  };

  const checkBalance = async () => {
    throw new Error("Balance check functionality not implemented");
  };

  return {
    getCatalog,
    purchaseGiftCard,
    checkBalance,
  };
};
