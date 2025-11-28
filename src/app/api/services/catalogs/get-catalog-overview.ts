import { db } from "@/utils/db";
import { parseImageUrl } from "@/app/api/rewards/utils/image-url-parser";
import { parseCpid } from "@/app/api/rewards/utils/cpid-transformer";
import { getSourceLetterFromProviderId } from "@/app/api/providers/services/provider-mapping";
import { serializeBigInt } from "@/app/api/_utils/formatters";

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

interface CatalogMembership {
  catalog_id: number;
  catalog_name: string;
  enterprise_id: number;
  enterprise_name: string;
  display_order?: number;
}

interface GroupedRewardWithCatalogs {
  cpid: string;
  type: "giftcard" | "offer";
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
  catalogs: CatalogMembership[];
}

async function transformCpid(reward: Reward): Promise<TransformedReward> {
  try {
    // Parse image URL using centralized utility (with cleaning for giftcards)
    const reward_image = parseImageUrl(
      reward.imageUrlsJson,
      reward.redemption_id,
      true // Use cleaning for control characters
    );

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

function groupRewardsByCpid(rewards: TransformedReward[]): GroupedRewardWithCatalogs[] {
  const groupedMap = new Map<string, TransformedReward[]>();

  // Separate rewards into gift cards and offers
  const giftcards = rewards.filter((reward) => reward.type === "giftcard");
  const offers = rewards.filter((reward) => reward.type === "offer");

  // Group gift cards by truncated CPID (existing behavior)
  // Special handling for dash CPIDs - each should be its own group
  giftcards.forEach((reward) => {
    let groupKey = reward.cpid;
    
    // If CPID is just a dash, make each reward its own group
    if (reward.cpid === "-") {
      groupKey = `giftcard-dash-${reward.redemption_id}`;
    }
    
    const existing = groupedMap.get(groupKey) || [];
    groupedMap.set(groupKey, [...existing, reward]);
  });

  // For offers, each offer becomes its own group using redemption_id as unique key
  offers.forEach((reward) => {
    const uniqueKey = `offer-${reward.redemption_id}`;
    groupedMap.set(uniqueKey, [reward]);
  });

  // Convert map to array of GroupedReward objects
  return Array.from(groupedMap.entries()).map(([, items]) => {
    const firstItem = items[0]; // Use the first item for common fields

    // Determine reward availability
    const availabilities = new Set(
      items.map((item) => item.reward_availability)
    );
    const reward_availability =
      availabilities.size === 1 ? firstItem.reward_availability : "mixed";

    // Determine aggregated reward status based on all items
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
      catalogs: [], // Will be populated by getCatalogMembership
    };
  });
}

async function getBulkCatalogMemberships(
  items: Array<{ redemption_id: string; type: string }>
): Promise<Map<string, CatalogMembership[]>> {
  try {
    if (items.length === 0) {
      return new Map();
    }

    // Collect unique redemption IDs by type to minimize query complexity
    const giftcardIds = items
      .filter(item => item.type === 'giftcard')
      .map(item => parseInt(item.redemption_id, 10));

    const offerIds = items
      .filter(item => item.type === 'offer')
      .map(item => parseInt(item.redemption_id, 10));

    // Fetch catalog memberships using Prisma
    const catalogMemberships = await db.redemption_registries.findMany({
      where: {
        OR: [
          {
            redemption_id: { in: giftcardIds },
            redemption_type: 'giftcard',
          },
          {
            redemption_id: { in: offerIds },
            redemption_type: 'offer',
          },
        ],
        registry_group: {
          deleted_date: null,
        },
      },
      include: {
        registry_group: {
          include: {
            enterprise: true,
          },
        },
      },
      distinct: ['redemption_id', 'redemption_type', 'registry_group_id'],
    });

    // Build a map for efficient lookup
    const membershipMap = new Map<string, CatalogMembership[]>();

    for (const membership of catalogMemberships) {
      const key = `${membership.redemption_id}-${membership.redemption_type}`;

      if (!membershipMap.has(key)) {
        membershipMap.set(key, []);
      }

      membershipMap.get(key)!.push({
        catalog_id: membership.registry_group.id,
        catalog_name: membership.registry_group.name || "Untitled Catalog",
        enterprise_id: membership.registry_group.ent_id,
        enterprise_name: membership.registry_group.enterprise.ent_name,
        display_order: membership.display_order || undefined,
      });
    }

    return membershipMap;
  } catch (error) {
    console.error("Error fetching bulk catalog memberships:", error);
    return new Map();
  }
}

export async function getCatalogOverview(
  tenantId: number
): Promise<GroupedRewardWithCatalogs[]> {
  try {
    // Fetch offers using Prisma query builder
    const offersRaw = await db.cp_redemptions.findMany({
      where: {
        is_deleted: 0,
      },
      select: {
        id: true,
        cpid: true,
        value: true,
        redem_value: true,
        brandName: true,
        inventory_remaining: true,
        title: true,
        startdate: true,
        enddate: true,
        reward_status: true,
        language: true,
        reward_availability: true,
        tags: true,
        imageUrl: true,
      },
    });

    // Fetch tenant registry for offers
    const offerRegistries = await db.tenant_registry_redemptions.findMany({
      where: {
        tenant_id: tenantId,
        redemption_type: 'offer',
        redemption_id: { in: offersRaw.map(o => o.id) },
      },
    });

    const offerRegistryMap = new Map(
      offerRegistries.map(r => [`${r.redemption_id}-offer`, r.id])
    );

    const offers: Reward[] = offersRaw.map(cr => ({
      redemption_registries_id: offerRegistryMap.get(`${cr.id}-offer`)?.toString() ?? null,
      tenant_id: tenantId.toString(),
      redemption_id: cr.id.toString(),
      cpid: cr.cpid,
      redemption_type: 'offer' as const,
      value: cr.value ?? '',
      poynts: cr.redem_value?.toString() ?? '',
      name: cr.brandName,
      inventory_remaining: cr.inventory_remaining?.toString() ?? '',
      title: cr.title ?? '',
      startdate: cr.startdate?.toISOString(),
      enddate: cr.enddate?.toISOString(),
      reward_status: (cr.reward_status as "active" | "suspended" | "deleted") ?? 'active',
      language: cr.language ?? '',
      reward_availability: cr.reward_availability ?? '',
      utid: '',
      value_type: '',
      tags: cr.tags ?? undefined,
      priority: '0',
      imageUrlsJson: cr.imageUrl ?? undefined,
    }));

    // Fetch giftcards using Prisma query builder
    const giftcardsRaw = await db.redemption_giftcards.findMany({
      where: {
        value: { gt: 0 },
      },
      include: {
        redemption_giftcard_items: {
          include: {
            redemption_giftcard_brands: true,
          },
        },
      },
    });

    // Fetch tenant registry for giftcards
    const giftcardRegistries = await db.tenant_registry_redemptions.findMany({
      where: {
        tenant_id: tenantId,
        redemption_type: 'giftcard',
        redemption_id: { in: giftcardsRaw.map(g => g.giftcard_id) },
      },
    });

    const giftcardRegistryMap = new Map(
      giftcardRegistries.map(r => [`${r.redemption_id}-giftcard`, r.id])
    );

    const giftcards: Reward[] = giftcardsRaw.map(rg => ({
      redemption_registries_id: giftcardRegistryMap.get(`${rg.giftcard_id}-giftcard`)?.toString() ?? null,
      tenant_id: tenantId.toString(),
      redemption_id: rg.giftcard_id.toString(),
      cpid: rg.cpid,
      redemption_type: 'giftcard' as const,
      value: rg.value.toString(),
      poynts: rg.redem_value.toString(),
      name: rg.redemption_giftcard_items.redemption_giftcard_brands.brandName,
      inventory_remaining: rg.inventory_remaining.toString(),
      title: rg.redemption_giftcard_items.rewardName ?? '',
      startdate: '',
      enddate: '',
      reward_status: (rg.redemption_giftcard_items.reward_status as "active" | "suspended" | "deleted") ?? 'active',
      language: rg.language ?? '',
      reward_availability: rg.redemption_giftcard_items.reward_availability ?? '',
      utid: rg.redemption_giftcard_items.utid ?? '',
      value_type: rg.redemption_giftcard_items.valueType ?? '',
      tags: rg.tags ?? undefined,
      priority: rg.priority?.toString() ?? '1',
      imageUrlsJson: rg.redemption_giftcard_items.redemption_giftcard_brands.imageUrls_json ?? undefined,
      provider_id: rg.redemption_giftcard_items.provider_id?.toString(),
    }));

    // Combine and process the rewards
    const allRewards = [...offers, ...giftcards];

    // Transform rewards and filter out those with empty CPIDs
    const transformedRewards = await Promise.all(allRewards.map(transformCpid));
    const filteredRewards = transformedRewards.filter(
      (reward) => reward.cpid !== "" && reward.reward_status !== "deleted"
    );

    const groupedRewards = groupRewardsByCpid(filteredRewards);

    // Collect all unique items that need catalog membership lookup
    const allItems: Array<{ redemption_id: string; type: string }> = [];
    for (const reward of groupedRewards) {
      for (const item of reward.items) {
        allItems.push({
          redemption_id: item.redemption_id,
          type: item.type
        });
      }
    }

    // Fetch ALL catalog memberships in a single bulk query
    const bulkMemberships = await getBulkCatalogMemberships(allItems);

    // Now assign the memberships to each reward
    for (const reward of groupedRewards) {
      const catalogMemberships = new Map<string, CatalogMembership>();

      // Collect catalog memberships from all items in the group
      for (const item of reward.items) {
        const key = `${item.redemption_id}-${item.type}`;
        const memberships = bulkMemberships.get(key) || [];

        // Add to our map to deduplicate
        memberships.forEach((membership) => {
          const mapKey = `${membership.catalog_id}-${membership.enterprise_id}`;
          catalogMemberships.set(mapKey, membership);
        });
      }

      // Convert map back to array and sort by enterprise name
      reward.catalogs = Array.from(catalogMemberships.values()).sort((a, b) =>
        a.enterprise_name.localeCompare(b.enterprise_name)
      );
    }

    // Sort data: gift cards first, then offers, each sorted by title
    groupedRewards.sort((a, b) => {
      // Sort by type first (giftcard before offer)
      if (a.type !== b.type) {
        return a.type === "giftcard" ? -1 : 1;
      }
      // Then sort by title alphabetically
      return a.title.localeCompare(b.title);
    });

    // Serialize BigInt values before returning
    const serializedData = serializeBigInt(groupedRewards);
    return serializedData;
  } catch (error) {
    console.error("Error fetching catalog overview:", error);
    throw new Error("Failed to fetch catalog overview");
  }
}
