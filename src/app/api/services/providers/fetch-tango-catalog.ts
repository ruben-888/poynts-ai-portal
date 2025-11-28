import { createTangoProvider } from "@/interfaces/providers/tango";

export interface TangoCatalogProduct {
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

export interface TangoCatalogResponse {
  products: TangoCatalogProduct[];
}

/**
 * Fetches gift card catalog data from Tango API
 * 
 * @returns Promise<TangoCatalogResponse> - The catalog data from Tango
 * @throws Error if the request fails or if required environment variables are missing
 */
export async function fetchTangoCatalog(): Promise<TangoCatalogResponse> {
  try {
    // Create Tango provider instance
    const tangoProvider = createTangoProvider({
      providerId: "tango",
      providerName: "Tango"
    });

    // Fetch catalog using the provider
    const catalogData = await tangoProvider.getCatalog();

    return catalogData;
  } catch (error) {
    console.error("Error fetching Tango catalog:", error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Tango catalog: ${error.message}`);
    }
    
    throw new Error("Failed to fetch Tango catalog: Unknown error");
  }
}