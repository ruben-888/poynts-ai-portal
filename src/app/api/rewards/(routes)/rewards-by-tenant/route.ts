import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { auth } from "@clerk/nextjs/server";
import { serializeBigInt } from "@/app/api/_utils/formatters";
import { parseImageUrl } from "@/app/api/rewards/utils/image-url-parser";
import { parseCpid } from "@/app/api/rewards/utils/cpid-transformer";
import { getSourceLetterFromProviderId } from "@/app/api/providers/services/provider-mapping";

interface Reward {
  redemption_registries_id: string | null;
  tenant_id: string;
  redemption_id: string;
  cpid: string | null;
  redemption_type: "offer" | "giftcard";
  value: string;
  poynts: string;
  title: string;
  name: string | null;
  inventory_remaining: string;
  startdate?: string;
  enddate?: string;
  reward_status: "active" | "suspended" | "deleted";
  reward_availability: string;
  language: string;
  utid: string;
  value_type: string;
  tags?: string;
  priority: string;
  imageUrlsJson?: string;
  provider_id?: string;
  imageUrl?: string;
}

interface TransformedReward
  extends Omit<
    Reward,
    "cpid" | "redemption_type" | "priority" | "imageUrlsJson"
  > {
  cpidx: string;
  cpid: string;
  type: "giftcard" | "offer";
  priority: number;
  reward_image?: string;
  source_letter: string;
}

interface GroupedReward {
  cpid: string;
  type: "giftcard" | "offer";
  title: string;
  brand_name: string;
  language: string;
  value: number;
  poynts: number;
  source_count: number;
  tenant_id: string;
  reward_status: string;
  reward_availability: string;
  tags?: string;
  startdate?: string;
  enddate?: string;
  is_enabled: boolean;
  value_type: string;
  items: TransformedReward[];
}

async function transformCpid(reward: Reward): Promise<TransformedReward> {
  try {
    // Parse image URL using centralized utility (simple parsing)
    const reward_image = parseImageUrl(reward.imageUrlsJson, reward.redemption_id, false);

    // Get source letter: "O" for offers, database lookup for giftcards
    const source_letter = reward.redemption_type === "offer"
      ? "O"
      : await getSourceLetterFromProviderId(reward.provider_id);

    // Parse CPID using centralized utility
    const { cpidx, cpid } = parseCpid(reward.cpid, reward.redemption_id);

    // Destructure to exclude imageUrlsJson from the output
    const { imageUrlsJson, ...rewardWithoutImageJson } = reward;

    return {
      ...rewardWithoutImageJson,
      cpidx,
      cpid,
      type: reward.redemption_type,
      priority: parseInt(reward.priority) || 0,
      reward_image,
      source_letter,
    };
  } catch (error) {
    console.warn(
      `Error transforming CPID for reward ${reward.redemption_id}:`,
      error
    );
    const { imageUrlsJson, ...rewardWithoutImageJson } = reward;
    return {
      ...rewardWithoutImageJson,
      cpidx: reward.cpid || "",
      cpid: reward.cpid || "",
      type: reward.redemption_type,
      priority: parseInt(reward.priority) || 0,
      reward_image: undefined,
      source_letter: reward.redemption_type === "offer"
        ? "O"
        : await getSourceLetterFromProviderId(reward.provider_id),
    };
  }
}

function groupRewardsByCpid(rewards: TransformedReward[]): GroupedReward[] {
  const groupedMap = new Map<string, TransformedReward[]>();

  // Separate rewards into gift cards and offers
  const giftcards = rewards.filter((reward) => reward.type === "giftcard");
  const offers = rewards.filter((reward) => reward.type === "offer");

  // Group gift cards by truncated CPID (existing behavior)
  giftcards.forEach((reward) => {
    const existing = groupedMap.get(reward.cpid) || [];
    groupedMap.set(reward.cpid, [...existing, reward]);
  });

  // For offers, each offer becomes its own group using redemption_id as unique key
  offers.forEach((reward) => {
    const uniqueKey = `offer-${reward.redemption_id}`;
    groupedMap.set(uniqueKey, [reward]);
  });

  // Convert map to array of GroupedReward objects
  return Array.from(groupedMap.entries()).map(([key, items]) => {
    const firstItem = items[0]; // Use the first item for common fields

    // Determine reward availability
    const availabilities = new Set(
      items.map((item) => item.reward_availability)
    );
    const reward_availability =
      availabilities.size === 1 ? firstItem.reward_availability : "mixed";

    // Determine aggregated reward status based on all items
    // If any item is active, the group is active
    // If all items are suspended, the group is suspended
    // If all items are inactive, the group is inactive
    let reward_status = "inactive";
    const hasActive = items.some((item) => item.reward_status === "active");
    const allSuspended = items.every(
      (item) => item.reward_status === "suspended"
    );

    if (hasActive) {
      reward_status = "active";
    } else if (allSuspended) {
      reward_status = "suspended";
    }

    // Cast value to integer, defaulting to 0 if null/undefined/empty
    const value = parseInt(firstItem.value) || 0;
    const poynts = parseInt(firstItem.poynts) || 0;

    // Determine if any item has a redemption_registries_id
    const is_enabled = items.some(
      (item) => item.redemption_registries_id !== null
    );

    return {
      cpid: firstItem.cpid, // For offers, this will be their individual CPID; for gift cards, the grouped CPID
      type: firstItem.type,
      title: firstItem.title,
      brand_name: firstItem.name || "unknown",
      language: firstItem.language,
      value,
      poynts,
      source_count: items.length,
      tenant_id: firstItem.tenant_id,
      reward_status,
      reward_availability,
      tags: firstItem.tags,
      startdate: firstItem.startdate,
      enddate: firstItem.enddate,
      is_enabled,
      value_type: firstItem.value_type,
      items,
    };
  });
}

export async function GET(req: Request) {
  try {
    const { has } = await auth();

    if (!has({ permission: "org:rewards:view" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get tenant_id from query params
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenant_id");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id is required" },
        { status: 400 }
      );
    }

    // Fetch offers from cp_redemptions table
    const offers = await db.$queryRaw<Reward[]>`
      SELECT 
        rr.id AS redemption_registries_id, 
        ${tenantId} AS tenant_id, 
        cr.id AS redemption_id, 
        cr.cpid AS cpid, 
        'offer' AS redemption_type, 
        cr.value AS value, 
        cr.redem_value AS poynts, 
        cr.brandName AS name, 
        cr.inventory_remaining, 
        cr.title, 
        cr.startdate, 
        cr.enddate, 
        cr.reward_status AS reward_status, 
        cr.language AS language, 
        cr.reward_availability AS reward_availability, 
        '' AS utid, 
        '' as value_type, 
        cr.tags AS tags, 
        0 AS priority,
        cr.imageUrl AS imageUrlsJson
      FROM cp_redemptions cr
      LEFT JOIN enterprise e ON cr.entid = e.ent_id
      LEFT JOIN tenant_registry_redemptions rr ON rr.tenant_id = ${tenantId} AND rr.redemption_id = cr.id AND rr.redemption_type = 'offer'
      WHERE NOT cr.is_deleted
      GROUP BY cr.id
    `;

    // Fetch giftcards from redemption_giftcards table
    const giftcards = await db.$queryRaw<Reward[]>`
      SELECT 
        rr.id AS redemption_registries_id, 
        ${tenantId} AS tenant_id, 
        rg.giftcard_id AS redemption_id, 
        rg.cpid AS cpid, 
        'giftcard' AS redemption_type, 
        rg.value, 
        rg.redem_value AS poynts, 
        rgb.brandName AS name, 
        rg.inventory_remaining, 
        rgi.rewardName AS title, 
        '' AS startdate, 
        '' AS enddate, 
        rgi.reward_status AS reward_status, 
        rg.language AS language, 
        rgi.reward_availability AS reward_availability, 
        rgi.utid AS utid, 
        rgi.valueType as value_type, 
        rg.tags AS tags, 
        rg.priority AS priority,
        rgb.imageUrls_Json AS imageUrlsJson,
        rgi.provider_id AS provider_id
      FROM redemption_giftcards rg
      LEFT JOIN tenant_registry_redemptions rr ON rr.tenant_id = ${tenantId} AND rr.redemption_id = rg.giftcard_id AND rr.redemption_type = 'giftcard'
      LEFT JOIN redemption_giftcard_items rgi ON rgi.item_id = rg.item_id
      LEFT JOIN redemption_giftcard_brands rgb ON rgb.brand_id = rgi.brand_id
      WHERE CAST(rg.value AS DECIMAL) > 0
      GROUP BY rg.giftcard_id
    `;

    // Combine and process the rewards
    const allRewards = [...offers, ...giftcards];

    // Transform rewards and filter out those with empty CPIDs
    const transformedRewards = (await Promise.all(allRewards.map(transformCpid)))
      .filter(
        (reward) => reward.cpid !== "" && reward.reward_status !== "deleted"
      );

    const data = groupRewardsByCpid(transformedRewards);

    // Sort data: gift cards first, then offers, each sorted by title
    data.sort((a, b) => {
      // Sort by type first (giftcard before offer)
      if (a.type !== b.type) {
        return a.type === "giftcard" ? -1 : 1;
      }
      // Then sort by title alphabetically
      return a.title.localeCompare(b.title);
    });

    // Serialize BigInt values before sending the response
    const serializedData = serializeBigInt(data);

    return NextResponse.json({ data: serializedData });
  } catch (error) {
    console.error("Error fetching rewards by tenant:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards by tenant" },
      { status: 500 }
    );
  }
}
