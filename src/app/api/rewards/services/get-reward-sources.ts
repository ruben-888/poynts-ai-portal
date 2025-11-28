import { db } from "@/utils/db";
import { Prisma } from "@prisma/client";
import { getSourceLetterFromProviderId } from "@/app/api/providers/services/provider-mapping";
import type { SourcesItem } from "@/app/api/rewards/(routes)/sources/schema";

/**
 * Get reward sources for multiple CPIDs
 * @param cpids - Array of CPIDs to fetch sources for
 * @returns Array of sources grouped by CPID
 */
export async function getRewardSources(
  cpids: string[],
): Promise<SourcesItem[]> {
  // Fetch gift card sources
  const giftcardSources = await db.$queryRaw<
    {
      cpid: string;
      provider_id: number;
      reward_status: string;
      reward_availability: string;
      full_cpid: string;
    }[]
  >(Prisma.sql`
    SELECT
      SUBSTRING_INDEX(rg.cpid, '-', 4) as cpid,
      rgi.provider_id,
      rgi.reward_status,
      rgi.reward_availability,
      rg.cpid as full_cpid
    FROM redemption_giftcards rg
    LEFT JOIN redemption_giftcard_items rgi ON rgi.item_id = rg.item_id
    WHERE SUBSTRING_INDEX(rg.cpid, '-', 4) IN (${Prisma.join(cpids.map((cpid) => Prisma.sql`${cpid}`))})
      AND rg.cpid IS NOT NULL
      AND rg.cpid != ''
      AND rgi.provider_id IS NOT NULL
    GROUP BY rg.cpid, rgi.provider_id
  `);

  // Fetch offer sources
  const offerSources = await db.$queryRaw<
    {
      cpid: string;
      reward_status: string;
      reward_availability: string;
      full_cpid: string;
    }[]
  >(Prisma.sql`
    SELECT
      cr.cpid as cpid,
      cr.reward_status,
      cr.reward_availability,
      cr.cpid as full_cpid
    FROM cp_redemptions cr
    WHERE cr.cpid IN (${Prisma.join(cpids.map((cpid) => Prisma.sql`${cpid}`))})
      AND cr.cpid IS NOT NULL
      AND cr.cpid != ''
      AND NOT cr.is_deleted
    GROUP BY cr.cpid
  `);

  // Process and group the results
  const sourcesMap = new Map<string, SourcesItem>();

  // Initialize map with empty arrays for all requested CPIDs
  cpids.forEach((cpid) => {
    sourcesMap.set(cpid, {
      cpid,
      sources: [],
    });
  });

  // Process gift card sources with centralized provider mapping
  for (const source of giftcardSources) {
    const existing = sourcesMap.get(source.cpid);
    if (existing) {
      // Use centralized function to get source letter
      const source_letter = await getSourceLetterFromProviderId(source.provider_id);

      existing.sources.push({
        source_letter,
        status: source.reward_status as "active" | "suspended" | "inactive",
        provider_id: source.provider_id,
        reward_availability: source.reward_availability,
        cpidx: source.full_cpid,
      });
    }
  }

  // Process offer sources
  offerSources.forEach((source) => {
    const existing = sourcesMap.get(source.cpid);
    if (existing) {
      existing.sources.push({
        source_letter: "O", // Offers always use "O"
        status: source.reward_status as "active" | "suspended" | "inactive",
        provider_id: null,
        reward_availability: source.reward_availability,
        cpidx: source.full_cpid,
      });
    }
  });

  // Convert map to array and sort sources within each group
  const result = Array.from(sourcesMap.values()).map((item) => ({
    ...item,
    sources: item.sources.sort((a, b) =>
      a.source_letter.localeCompare(b.source_letter),
    ),
  }));

  return result;
}
