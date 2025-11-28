import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { has } = await auth();

    if (!has({ permission: "org:rewards:view" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch tags from gift cards
    const giftcardTags = await db.$queryRaw<{ tags: string }[]>`
      SELECT tags FROM redemption_giftcards 
      WHERE tags IS NOT NULL AND tags != '' 
      GROUP BY tags
    `;

    // Fetch tags from offers
    const offerTags = await db.$queryRaw<{ tags: string }[]>`
      SELECT tags FROM cp_redemptions 
      WHERE tags IS NOT NULL AND tags != '' AND NOT is_deleted
      GROUP BY tags
    `;

    // Combine all tags and split them (they're comma-separated)
    const allTags = new Set<string>();

    // Process gift card tags
    giftcardTags.forEach((item) => {
      if (item.tags) {
        item.tags.split(",").forEach((tag) => {
          const trimmedTag = tag.trim();
          if (trimmedTag) {
            allTags.add(trimmedTag);
          }
        });
      }
    });

    // Process offer tags
    offerTags.forEach((item) => {
      if (item.tags) {
        item.tags.split(",").forEach((tag) => {
          const trimmedTag = tag.trim();
          if (trimmedTag) {
            allTags.add(trimmedTag);
          }
        });
      }
    });

    // Convert to array and sort alphabetically
    const uniqueTags = Array.from(allTags).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    // Format the response to match the expected format in the TagInput component
    const formattedTags = uniqueTags.map((name) => ({
      id: `tag-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
    }));

    return NextResponse.json({ data: formattedTags });
  } catch (error) {
    console.error("Error fetching reward tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch reward tags" },
      { status: 500 }
    );
  }
}
