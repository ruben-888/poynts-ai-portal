import axios from "axios";

interface TremendousImage {
  src: string;
  type: string;
  content_type: string;
}

interface TremendousSku {
  min: number;
  max: number;
}

interface TremendousCountry {
  abbr: string;
}

interface TremendousDocuments {
  cardholder_agreement_pdf?: string;
  cardholder_agreement_url?: string;
  privacy_policy_url?: string;
}

interface TremendousProduct {
  id: string;
  name: string;
  currency_codes: string[];
  category: string;
  images: TremendousImage[];
  skus: TremendousSku[];
  countries: TremendousCountry[];
  disclosure: string;
  usage_instructions: string;
  description: string;
  documents?: TremendousDocuments;
}

interface TremendousCatalogResponse {
  products: TremendousProduct[];
}

export async function fetchTremendousCatalog(
  country: string = "US",
  currency: string = "USD"
): Promise<TremendousCatalogResponse> {
  const apiKey = process.env.TREMENDOUS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing required environment variable: TREMENDOUS_API_KEY");
  }

  try {
    const response = await axios.get<TremendousCatalogResponse>(
      "https://api.tremendous.com/api/v2/products",
      {
        // params: {
        //   country,
        //   currency,
        // },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch Tremendous catalog: ${error.response?.status} ${error.response?.statusText}`
      );
    }
    throw error;
  }
}
