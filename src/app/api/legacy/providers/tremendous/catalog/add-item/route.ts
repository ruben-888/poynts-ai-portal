import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";

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
}

export async function POST(request: NextRequest) {
  try {
    // Check permissions
    const { has, userId } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { product }: { product: TremendousProduct } = await request.json();

    if (!product || !product.id || !product.name) {
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 }
      );
    }

    // Start database transaction
    const result = await db.$transaction(async (tx) => {
      // Find or create Tremendous provider
      let tremendousProvider = await tx.providers.findFirst({
        where: { 
          OR: [
            { code: "tremendous" },
            { code: "TREMENDOUS" },
            { name: "Tremendous" },
            { name: "tremendous" }
          ]
        },
      });

      if (!tremendousProvider) {
        // Create Tremendous provider if it doesn't exist
        tremendousProvider = await tx.providers.create({
          data: {
            name: "Tremendous",
            code: "tremendous",
            description: "Tremendous Gift Card Provider",
            enabled: 1,
            retries: 2,
            retry_delay: 2,
            suspend_on_fail: 1,
            suspend_on_fail_limit: 4,
          },
        });
      }

      // Check if brand already exists
      let brand = await tx.redemption_giftcard_brands.findFirst({
        where: { brandKey: product.id },
      });

      // Create brand if it doesn't exist
      if (!brand) {
        // Transform Tremendous images to expected format
        const imageUrls: Record<string, string> = {};
        
        // Find the best available image (prefer card, then logo)
        const cardImage = product.images?.find(img => img.type === "card");
        const logoImage = product.images?.find(img => img.type === "logo");
        const primaryImage = cardImage || logoImage;
        
        if (primaryImage && primaryImage.src) {
          // Use the same image URL for all size variants (since Tremendous doesn't provide multiple sizes)
          imageUrls["1200w-326ppi"] = primaryImage.src;
          imageUrls["130w-326ppi"] = primaryImage.src;
          imageUrls["200w-326ppi"] = primaryImage.src;
          imageUrls["278w-326ppi"] = primaryImage.src;
          imageUrls["300w-326ppi"] = primaryImage.src;
          imageUrls["80w-326ppi"] = primaryImage.src;
        }
        
        brand = await tx.redemption_giftcard_brands.create({
          data: {
            brandKey: product.id,
            brandName: product.name,
            description: product.description || null,
            terms: product.disclosure || null,
            imageUrls_json: Object.keys(imageUrls).length > 0 ? JSON.stringify(imageUrls) : null,
            status: "active",
            createdDate: new Date().toISOString(),
            lastUpdateDate: new Date().toISOString(),
          },
        });
      }

      // Check if item already exists
      const existingItem = await tx.redemption_giftcard_items.findFirst({
        where: {
          brand_id: brand.brand_id,
          utid: product.id,
        },
      });

      if (existingItem) {
        return {
          success: false,
          error: "Item already exists for this brand",
          brand_id: brand.brand_id,
          item_id: existingItem.item_id,
        };
      }

      // Determine value type based on SKU
      const sku = product.skus[0];
      const valueType = sku && sku.min === sku.max ? "FIXED_VALUE" : "VARIABLE_VALUE";

      // Create gift card item
      const item = await tx.redemption_giftcard_items.create({
        data: {
          brand_id: brand.brand_id,
          provider_id: tremendousProvider.id,
          utid: product.id,
          rewardName: product.name,
          currencyCode: product.currency_codes[0] || "USD",
          status: "active",
          reward_status: "active",
          reward_availability: "AVAILABLE",
          valueType: valueType,
          rewardType: "giftcard",
          minValue: sku?.min || null,
          maxValue: sku?.max || null,
          countries_json: JSON.stringify(product.countries),
          redemptionInstructions: product.usage_instructions || null,
          createdDate: new Date().toISOString(),
          lastUpdateDate: new Date().toISOString(),
        },
      });

      return {
        success: true,
        brand_id: brand.brand_id,
        item_id: item.item_id,
        brand_name: brand.brandName,
        item_name: item.rewardName,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error adding Tremendous item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add item",
      },
      { status: 500 }
    );
  }
}