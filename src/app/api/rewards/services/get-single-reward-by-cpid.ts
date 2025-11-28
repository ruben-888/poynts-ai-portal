import { db } from "@/utils/db";
import { getSourceLetterFromProviderId } from "@/app/api/providers/services/provider-mapping";
import { serializeBigInt } from "@/app/api/_utils/formatters";
import { parseImageUrl } from "@/app/api/rewards/utils/image-url-parser";
import { parseCpid } from "@/app/api/rewards/utils/cpid-transformer";

interface Reward {
  redemption_registries_id: string | null;
  tenant_id: string;
  redemption_id: string;
  cpid: string | null;
  redemption_type: "giftcard";
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
  source_letter?: string;
  description?: string;
  disclaimer?: string;
  terms?: string;
  item_id?: number;
  rebate_provider_percentage?: number;
  rebate_base_percentage?: number;
  rebate_customer_percentage?: number;
  rebate_cp_percentage?: number;
}

interface RelatedCard {
  giftcard_id: number;
  reward_name: string;
  brand_name: string;
  cpidx: string;
  value: string;
  reward_status: string;
}

interface TransformedReward
  extends Omit<
    Reward,
    | "cpid"
    | "redemption_type"
    | "priority"
    | "imageUrlsJson"
    | "redemption_id"
    | "tenant_id"
  > {
  id: number;
  cpidx: string;
  cpid: string;
  type: "giftcard";
  priority: number;
  reward_image?: string;
  source_letter: string;
  item_id?: number;
  related_cards?: RelatedCard[];
  rebate_provider_percentage?: number;
  rebate_base_percentage?: number;
  rebate_customer_percentage?: number;
  rebate_cp_percentage?: number;
}

interface GroupedReward {
  cpid: string;
  type: "giftcard";
  title: string;
  brand_name: string;
  language: string;
  value: number;
  poynts: number;
  source_count: number;
  reward_status: string;
  reward_availability: string;
  tags?: string;
  startdate?: string;
  enddate?: string;
  is_enabled: boolean;
  value_type: string;
  items: TransformedReward[];
  description?: string;
  disclaimer?: string;
  terms?: string;
}

async function transformCpid(reward: Reward): Promise<TransformedReward> {
  try {
    // Parse image URL using centralized utility (simple parsing for giftcards)
    const reward_image = parseImageUrl(reward.imageUrlsJson, reward.redemption_id, false);

    // Use source letter from database
    const source_letter = reward.source_letter || "?";

    // Parse CPID using centralized utility
    const { cpidx, cpid } = parseCpid(reward.cpid, reward.redemption_id);

    // Destructure to exclude imageUrlsJson from the output
    const {
      imageUrlsJson,
      redemption_id,
      tenant_id,
      ...rewardWithoutExcludedFields
    } = reward;

    // Convert rebate percentages from Decimal to number
    const rebate_provider_percentage = reward.rebate_provider_percentage ? Number(reward.rebate_provider_percentage) : undefined;
    const rebate_base_percentage = reward.rebate_base_percentage ? Number(reward.rebate_base_percentage) : undefined;
    const rebate_customer_percentage = reward.rebate_customer_percentage ? Number(reward.rebate_customer_percentage) : undefined;
    const rebate_cp_percentage = reward.rebate_cp_percentage ? Number(reward.rebate_cp_percentage) : undefined;

    return {
      ...rewardWithoutExcludedFields,
      id: Number(redemption_id) || 0,
      cpidx,
      cpid,
      type: reward.redemption_type,
      priority: parseInt(reward.priority) || 0,
      reward_image,
      source_letter,
      item_id: reward.item_id,
      rebate_provider_percentage,
      rebate_base_percentage,
      rebate_customer_percentage,
      rebate_cp_percentage,
    };
  } catch (error) {
    console.warn(
      `Error transforming CPID for reward ${reward.redemption_id}:`,
      error
    );
    const {
      imageUrlsJson,
      redemption_id,
      tenant_id,
      ...rewardWithoutExcludedFields
    } = reward;
    return {
      ...rewardWithoutExcludedFields,
      id: Number(redemption_id) || 0,
      cpidx: reward.cpid || "",
      cpid: reward.cpid || "",
      type: reward.redemption_type,
      priority: parseInt(reward.priority) || 0,
      reward_image: undefined,
      source_letter: "?",
      item_id: reward.item_id,
      rebate_provider_percentage: reward.rebate_provider_percentage ? Number(reward.rebate_provider_percentage) : undefined,
      rebate_base_percentage: reward.rebate_base_percentage ? Number(reward.rebate_base_percentage) : undefined,
      rebate_customer_percentage: reward.rebate_customer_percentage ? Number(reward.rebate_customer_percentage) : undefined,
      rebate_cp_percentage: reward.rebate_cp_percentage ? Number(reward.rebate_cp_percentage) : undefined,
    };
  }
}

function groupRewardsByCpid(
  rewards: TransformedReward[]
): GroupedReward | null {
  if (rewards.length === 0) {
    return null;
  }

  const items = rewards;
  const firstItem = items[0]; // Use the first item for common fields

  // Determine reward availability
  const availabilities = new Set(items.map((item) => item.reward_availability));
  const reward_availability =
    availabilities.size === 1 ? firstItem.reward_availability : "mixed";

  // Determine aggregated reward status
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
    cpid: firstItem.cpid,
    type: firstItem.type,
    title: firstItem.title,
    brand_name: firstItem.name || "unknown",
    language: firstItem.language,
    value,
    poynts,
    source_count: items.length,
    reward_status,
    reward_availability,
    tags: firstItem.tags,
    startdate: firstItem.startdate,
    enddate: firstItem.enddate,
    is_enabled,
    value_type: firstItem.value_type,
    items,
    description: firstItem.description,
    disclaimer: firstItem.disclaimer,
    terms: firstItem.terms,
  };
}

// Helper function to fetch related cards by item_id
async function getRelatedCardsByItemIds(
  itemIds: number[]
): Promise<Map<number, RelatedCard[]>> {
  if (!itemIds.length) return new Map();

  // Query to get all gift cards related to these item_ids
  const relatedCards = await db.$queryRaw<
    Array<{
      item_id: number;
      giftcard_id: number;
      reward_name: string;
      brand_name: string;
      cpid: string;
      value: string;
      reward_status: string;
    }>
  >`
    SELECT 
      rg.item_id,
      rg.giftcard_id,
      rgi.rewardName AS reward_name,
      rgb.brandName AS brand_name,
      rg.cpid,
      rg.value,
      rgi.reward_status
    FROM redemption_giftcards rg
    JOIN redemption_giftcard_items rgi ON rgi.item_id = rg.item_id
    JOIN redemption_giftcard_brands rgb ON rgb.brand_id = rgi.brand_id
    WHERE rg.item_id IN (${itemIds.join(",")})
  `;

  // Group the related cards by item_id
  const relatedCardsByItemId = new Map<number, RelatedCard[]>();

  for (const card of relatedCards) {
    if (!relatedCardsByItemId.has(card.item_id)) {
      relatedCardsByItemId.set(card.item_id, []);
    }

    relatedCardsByItemId.get(card.item_id)!.push({
      giftcard_id: card.giftcard_id,
      reward_name: card.reward_name,
      brand_name: card.brand_name,
      cpidx: card.cpid,
      value: card.value,
      reward_status: card.reward_status,
    });
  }

  return relatedCardsByItemId;
}

// CPID Example: GC-ACEHAR-EN-10
export async function getSingleRewardByCPID(cpid: string, includeRebateData: boolean = false) {
  // Parse CPID using centralized utility to get truncated version (first 4 parts)
  const { cpid: exactCpidToMatch } = parseCpid(cpid);

  // Validate CPID format
  if (!exactCpidToMatch) {
    console.warn(`Invalid CPID format: ${cpid}`);
    return null;
  }

  // Fetch the giftcards matching the exact CPID pattern
  // We need to ensure that after the 4th segment (the value),
  // either there's a dash or it's the end of the string
  const giftcards = await db.$queryRaw<Reward[]>`
    SELECT
      rr.id AS redemption_registries_id,
      '' AS tenant_id,
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
      rgi.provider_id AS provider_id,
      p.the_code_corrected AS source_letter,
      rgb.description AS description,
      rgb.disclaimer AS disclaimer,
      rgb.terms AS terms,
      rg.item_id AS item_id,
      rgi.rebate_provider_percentage AS rebate_provider_percentage,
      rgi.rebate_base_percentage AS rebate_base_percentage,
      rgi.rebate_customer_percentage AS rebate_customer_percentage,
      rgi.rebate_cp_percentage AS rebate_cp_percentage
    FROM redemption_giftcards rg
    LEFT JOIN tenant_registry_redemptions rr ON rr.redemption_id = rg.giftcard_id AND rr.redemption_type = 'giftcard'
    LEFT JOIN redemption_giftcard_items rgi ON rgi.item_id = rg.item_id
    LEFT JOIN redemption_giftcard_brands rgb ON rgb.brand_id = rgi.brand_id
    LEFT JOIN providers p ON p.id = rgi.provider_id
    WHERE (
      -- Match exact cpid like GC-ACEHAR-EN-10 (if no dash follows)
      rg.cpid = ${exactCpidToMatch}
      OR
      -- Match cpid with additional parts like GC-ACEHAR-EN-10-B-6393DB
      rg.cpid LIKE ${exactCpidToMatch + "-%"}
    )
    ORDER BY rg.priority ASC, rg.giftcard_id ASC
  `;

  // Transform rewards and filter out those with empty CPIDs or deleted status
  const transformedRewards = (await Promise.all(giftcards.map(transformCpid)))
    .filter(
      (reward) => reward.cpid !== "" && reward.reward_status !== "deleted"
    );

  // Extract all unique item_ids from the rewards
  const itemIds = [
    ...new Set(
      transformedRewards
        .map((reward) => reward.item_id)
        .filter((id): id is number => id !== undefined && id !== null)
    ),
  ];

  // Fetch all related cards for these item_ids
  const relatedCardsByItemId = await getRelatedCardsByItemIds(itemIds);

  // Add related cards to each reward
  const rewardsWithRelatedCards = transformedRewards.map((reward) => {
    if (reward.item_id && relatedCardsByItemId.has(reward.item_id)) {
      // Filter out the current card from related cards
      const relatedCards = relatedCardsByItemId
        .get(reward.item_id)!
        .filter((card) => card.giftcard_id !== reward.id);

      return {
        ...reward,
        related_cards: relatedCards,
      };
    }
    return reward;
  });

  // Group rewards by the CPID
  const groupedReward = groupRewardsByCpid(rewardsWithRelatedCards);

  // Filter out rebate data if user doesn't have CP admin permissions
  if (!includeRebateData && groupedReward) {
    groupedReward.items = groupedReward.items.map(item => {
      const {
        rebate_provider_percentage,
        rebate_base_percentage,
        rebate_customer_percentage,
        rebate_cp_percentage,
        ...itemWithoutRebates
      } = item;
      return itemWithoutRebates;
    });
  }

  // Serialize BigInt values before returning
  return serializeBigInt(groupedReward);
}
