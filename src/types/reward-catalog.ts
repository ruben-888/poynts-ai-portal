/**
 * Unified Reward Catalog Types
 *
 * Standard format for catalog items across all reward sources
 * (Tremendous, Tango, Blackhawk, etc.)
 */

export interface SourceItem {
  id: string;
  source_fk: string;
  source_identifier: string;
  reward_fk: string | null;
  priority: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  sourceIdentifier: string;
  brandName: string;
  productName: string;
  description: string;
  faceValue: number;
  currency: string;
  countries: string[];
  status: "active" | "inactive";
  imageUrl: string;
  /** Source item if this catalog item is synced */
  sourceItem?: SourceItem | null;
  /** Raw provider data - only included when include_raw=true */
  rawData?: Record<string, unknown>;
}

export interface CatalogResponse {
  data: CatalogItem[];
  total: number;
}

export type RewardSourceId =
  | "source-tremendous"
  | "source-tango"
  | "source-blackhawk"
  | "source-internal";
