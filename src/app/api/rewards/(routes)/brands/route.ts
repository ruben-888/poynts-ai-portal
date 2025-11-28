import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { auth } from "@clerk/nextjs/server";
import { serializeBigInt } from "@/app/api/_utils/formatters";

// Exported interface matching the API response
export interface Brand {
  id: string | number;
  name: string;
  display_name: string;
  description?: string;
  image?: string;
  tag?: string;
  key?: string;
  itemCountsByProvider?: {
    tango: number;
    blackhawk: number;
    amazon: number;
    tremendous: number;
  };
}

export async function GET() {
  try {
    const { has } = await auth();

    if (!has({ permission: "org:rewards:view" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch brands using Prisma
    const brands = await db.redemption_giftcard_brands.findMany({
      orderBy: {
        brandName: "asc",
      },
    });

    // Find Tremendous provider ID
    const tremendousProvider = await db.providers.findFirst({
      where: {
        OR: [
          { code: "tremendous" },
          { code: "TREMENDOUS" },
          { name: "Tremendous" },
          { name: "tremendous" }
        ]
      },
      select: {
        id: true
      }
    });

    // Fetch item counts by provider for each brand
    const itemCounts = await db.redemption_giftcard_items.groupBy({
      by: ['brand_id', 'provider_id'],
      _count: {
        item_id: true,
      },
    });

    // Create a map for quick lookup of counts
    const countsMap = new Map<string, number>();
    itemCounts.forEach((count) => {
      const key = `${count.brand_id}-${count.provider_id}`;
      countsMap.set(key, count._count.item_id);
    });

    // Count occurrences of each brand name
    const brandNameCounts = brands.reduce<Record<string, number>>(
      (counts, brand) => {
        const name = brand.brandName ?? "unknown";
        counts[name] = (counts[name] || 0) + 1;
        return counts;
      },
      {}
    );

    // Process image URLs for each brand
    const processedBrands = brands.map((brand) => {
      let brandImage: string | undefined = undefined;

      // Extract image URL from imageUrlsJson if available
      if (brand.imageUrls_json && brand.imageUrls_json.trim()) {
        try {
          const imageUrls = JSON.parse(brand.imageUrls_json);

          // Try to get 300w image first
          if (imageUrls["300w-326ppi"]) {
            brandImage = imageUrls["300w-326ppi"];
          }
          // If not available, find the largest image by width
          else {
            let largestWidth = 0;
            Object.keys(imageUrls).forEach((key) => {
              // Extract width from key (format: "NNNw-326ppi")
              const match = key.match(/(\d+)w-/);
              if (match && match[1]) {
                const width = parseInt(match[1]);
                if (width > largestWidth) {
                  largestWidth = width;
                  brandImage = imageUrls[key];
                }
              }
            });

            // If no width-based images found, just take the first one
            if (!brandImage && Object.keys(imageUrls).length > 0) {
              brandImage = imageUrls[Object.keys(imageUrls)[0]];
            }
          }
        } catch (e) {
          console.warn(
            `Error parsing imageUrlsJson for brand ${brand.brand_id}: ${brand.imageUrls_json}`,
            e
          );
          // Continue with undefined brandImage
        }
      }

      // Create a display name that includes name and part of the description
      // ONLY if there are multiple brands with the same name
      let displayName = brand.brandName;
      if (
        brand.brandName &&
        brandNameCounts[brand.brandName] > 1 &&
        brand.description
      ) {
        // Strip HTML tags from description
        const plainDescription = brand.description.replace(/<[^>]*>/g, "");
        // Trim whitespace and get preview
        const descriptionPreview =
          plainDescription.trim().substring(0, 20) +
          (plainDescription.length > 20 ? "..." : "");

        if (descriptionPreview.trim()) {
          displayName = `${brand.brandName} (${descriptionPreview})`;
        }
      }

      // Get item counts for this brand by provider
      // Provider IDs: 2 = Tango, 3 = Amazon, 4 = Blackhawk, Tremendous = dynamic
      const tangoCount = countsMap.get(`${brand.brand_id}-2`) || 0;
      const amazonCount = countsMap.get(`${brand.brand_id}-3`) || 0;
      const blackhawkCount = countsMap.get(`${brand.brand_id}-4`) || 0;
      const tremendousCount = tremendousProvider 
        ? countsMap.get(`${brand.brand_id}-${tremendousProvider.id}`) || 0 
        : 0;

      // Return object matching the Brand interface
      return {
        id: brand.brand_id,
        name: brand.brandName,
        display_name: displayName,
        description: brand.description,
        image: brandImage,
        tag: brand.brandTag,
        key: brand.brandKey,
        itemCountsByProvider: {
          tango: tangoCount,
          blackhawk: blackhawkCount,
          amazon: amazonCount,
          tremendous: tremendousCount,
        },
      };
    });

    // Serialize BigInt values before sending the response
    const serializedData = serializeBigInt(processedBrands) as Brand[];

    return NextResponse.json({ data: serializedData });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
