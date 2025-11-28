import { db } from "@/utils/db";
import { fetchTangoCatalog } from "./fetch-tango-catalog";

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
export interface EnhancedTangoProduct extends TangoProduct {
  cardExists: boolean;
  associatedItems: AssociatedItem[];
}

// Helper function to parse image URLs
function parseImageUrl(imageUrlsJson?: string | null): string | undefined {
  if (!imageUrlsJson) return undefined;

  try {
    // Check if it's a data URL (base64 encoded image)
    if (imageUrlsJson.startsWith("data:image")) {
      return imageUrlsJson;
    }
    // Check if it's a direct HTTP/HTTPS URL or path
    else if (imageUrlsJson.startsWith("http") || imageUrlsJson.startsWith("/")) {
      return imageUrlsJson;
    }
    // Try to parse as JSON
    else if (imageUrlsJson.startsWith("{") || imageUrlsJson.startsWith("[")) {
      const imageUrls = JSON.parse(imageUrlsJson);
      
      // Try to get 300w image first
      if (imageUrls["300w-326ppi"]) {
        return imageUrls["300w-326ppi"];
      }
      // If not available, find the largest image by width
      else {
        let largestWidth = 0;
        let largestImage: string | undefined;
        Object.keys(imageUrls).forEach((key) => {
          const match = key.match(/(\d+)w-/);
          if (match && match[1]) {
            const width = parseInt(match[1]);
            if (width > largestWidth) {
              largestWidth = width;
              largestImage = imageUrls[key];
            }
          }
        });
        
        // If no width-based images found, just take the first one
        if (!largestImage && Object.keys(imageUrls).length > 0) {
          largestImage = imageUrls[Object.keys(imageUrls)[0]];
        }
        return largestImage;
      }
    }
    // If it doesn't match any pattern, try treating it as a direct URL anyway
    else {
      return imageUrlsJson;
    }
  } catch (e) {
    // If JSON parsing fails, treat it as a direct URL if it looks like one
    if (imageUrlsJson.startsWith("http") || imageUrlsJson.startsWith("/") || imageUrlsJson.startsWith("data:image")) {
      return imageUrlsJson;
    }
    return undefined;
  }
}

/**
 * Fetches Tango catalog data enriched with database information
 * @returns Promise<EnhancedTangoProduct[]> - The enriched catalog data
 */
export async function fetchEnrichedTangoCatalog(): Promise<EnhancedTangoProduct[]> {
  // Step 1: Fetch gift cards with their items and brands for provider_id = 2 (Tango)
  const giftCards = await db.redemption_giftcards.findMany({
    where: {
      redemption_giftcard_items: {
        provider_id: 2, // Tango provider ID
      },
      value: {
        gt: 0, // Only get cards with value > 0
      },
    },
    include: {
      redemption_giftcard_items: {
        include: {
          redemption_giftcard_brands: true,
        },
      },
    },
  });

  // Step 1b: Get all unique item IDs to fetch all cards for those items
  const itemIds = Array.from(new Set(giftCards.map(gc => gc.item_id).filter(id => id !== null)));
  
  // Step 1c: Fetch ALL gift cards for these items (not just Tango ones)
  const allCardsForItems = await db.redemption_giftcards.findMany({
    where: {
      item_id: {
        in: itemIds as number[],
      },
      value: {
        gt: 0,
      },
    },
    include: {
      redemption_giftcard_items: {
        include: {
          redemption_giftcard_brands: true,
        },
      },
    },
  });

  // Step 1d: Group all cards by item_id for easy lookup
  const cardsByItemId = new Map<number, GiftCard[]>();
  allCardsForItems.forEach(card => {
    if (card.item_id) {
      const item = card.redemption_giftcard_items;
      
      const giftCard: GiftCard = {
        giftcard_id: card.giftcard_id.toString(),
        reward_name: item?.rewardName || "",
        brand_name: item?.redemption_giftcard_brands?.brandName || "",
        cpidx: card.cpid || "",
        value: Number(card.value) || 0,
        reward_status: item?.reward_status || "suspended",
        rebate_provider_percentage: item?.rebate_provider_percentage ? Number(item.rebate_provider_percentage) : undefined,
        rebate_base_percentage: item?.rebate_base_percentage ? Number(item.rebate_base_percentage) : undefined,
        rebate_customer_percentage: item?.rebate_customer_percentage ? Number(item.rebate_customer_percentage) : undefined,
        rebate_cp_percentage: item?.rebate_cp_percentage ? Number(item.rebate_cp_percentage) : undefined,
      };
      
      if (!cardsByItemId.has(card.item_id)) {
        cardsByItemId.set(card.item_id, []);
      }
      cardsByItemId.get(card.item_id)!.push(giftCard);
    }
  });

  // Step 2: Extract UTIDs and create lookup map
  const utids = new Set<string>();
  const associatedItemsMap = new Map<string, AssociatedItem[]>();

  // Step 3: Process gift cards and create associated items
  giftCards.forEach((giftCard) => {
    const item = giftCard.redemption_giftcard_items;
    const brand = item?.redemption_giftcard_brands;
    
    if (item?.utid) {
      utids.add(item.utid);
      
      // Transform CPID
      let cpid = giftCard.cpid || "";
      const cpidx = cpid;
      
      // Validate and transform CPID format (first 4 parts)
      if (cpid) {
        const cpidParts = cpid.split("-");
        if (cpidParts.length >= 4) {
          cpid = cpidParts.slice(0, 4).join("-");
        }
      }
      
      // Get the cards for this item
      const cards = cardsByItemId.get(item.item_id) || [];
      
      const associatedItem: AssociatedItem = {
        redemption_id: giftCard.giftcard_id.toString(),
        cpid: cpid,
        cpidx: cpidx,
        type: "giftcard",
        value: giftCard.value?.toString() || "0",
        poynts: giftCard.redem_value?.toString() || "0",
        title: item.rewardName || "",
        name: brand?.brandName || null,
        inventory_remaining: giftCard.inventory_remaining?.toString() || "0",
        reward_status: item.reward_status as "active" | "suspended" | "deleted" || "suspended",
        reward_availability: item.reward_availability || "all",
        language: giftCard.language || "en",
        utid: item.utid,
        value_type: item.valueType || "VARIABLE_VALUE",
        tags: giftCard.tags || undefined,
        priority: parseInt(giftCard.priority?.toString() || "0") || 0,
        reward_image: parseImageUrl(brand?.imageUrls_Json),
        source_letter: "B", // Tango provider is always "B"
        item_id: item.item_id,
        brand_id: item.brand_id || 0,
        cards: cards,
      };
      
      if (!associatedItemsMap.has(item.utid)) {
        associatedItemsMap.set(item.utid, []);
      }
      associatedItemsMap.get(item.utid)!.push(associatedItem);
    }
  });

  // Step 4: Fetch catalog from Tango API
  const catalogData = await fetchTangoCatalog();

  // Step 5: Add cardExists field and associated items to each product in the response
  const enhancedProducts: EnhancedTangoProduct[] = catalogData.products.map((product: TangoProduct) => {
    // Check if the productId exists in our UTIDs set
    const cardExists = utids.has(product.productId);

    // Get associated items for this product's productId
    const associatedItems = associatedItemsMap.get(product.productId) || [];

    // Add the cardExists field and associated items to the product
    return {
      ...product,
      cardExists,
      associatedItems,
    };
  });

  return enhancedProducts;
}