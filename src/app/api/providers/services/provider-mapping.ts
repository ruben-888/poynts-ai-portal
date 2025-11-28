import { db } from "@/utils/db";

// Cache for provider mappings (refreshed periodically)
let providerMappingCache: Record<number, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = process.env.PROVIDER_MAPPING_CACHE_TTL 
  ? parseInt(process.env.PROVIDER_MAPPING_CACHE_TTL) 
  : 5 * 60 * 1000; // Default to 5 minutes if not set

/**
 * Fetch provider mappings from database with caching
 */
async function fetchProviderMappings(): Promise<Record<number, string>> {
  const now = Date.now();

  // Return cached data if still valid
  if (providerMappingCache && (now - cacheTimestamp) < CACHE_TTL) {
    return providerMappingCache;
  }

  try {
    const providers = await db.providers.findMany({
      select: {
        id: true,
        code: true // source_letter
      },
      where: {
        enabled: 1,
        code: {
          not: null,
          notIn: ["O"] // Exclude "O" used for offers
        }
      }
    });

    // Build mapping object: { provider_id: source_letter }
    const mapping: Record<number, string> = {};
    providers.forEach(provider => {
      if (provider.code) {
        mapping[provider.id] = provider.code;
      }
    });

    // Update cache
    providerMappingCache = mapping;
    cacheTimestamp = now;

    return mapping;
  } catch (error) {
    console.error("Failed to fetch provider mappings from database:", error);

    // Return empty mapping when database fails (all provider IDs will map to "?")
    return {};
  }
}

/**
 * Maps provider_id to source letter (async with database lookup)
 * @param providerId - The provider ID to map
 * @returns Source letter (A, B, C, D, etc.) or "?" for unknown
 */
export async function getSourceLetterFromProviderId(
  providerId: number | string | null | undefined
): Promise<string> {
  if (!providerId) return "?";

  const mappings = await fetchProviderMappings();
  const id = Number(providerId);

  return mappings[id] || "?";
}

/**
 * Get all available provider mappings
 */
export async function getAllProviderMappings(): Promise<Record<number, string>> {
  return await fetchProviderMappings();
}

/**
 * Invalidate cache (useful for admin operations)
 */
export function invalidateProviderMappingCache(): void {
  providerMappingCache = null;
  cacheTimestamp = 0;
}
