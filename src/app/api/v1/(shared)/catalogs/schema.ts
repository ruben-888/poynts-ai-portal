/**
 * Catalog domain response types
 */

import {
  CatalogTypeEnum,
  CatalogStatusEnum,
  StatusEnum,
  RewardTypeEnum,
  Inventory,
} from "../../_lib/schemas";

/**
 * Reward entity (embedded in catalog responses)
 */
export interface Reward {
  id: string;
  type?: RewardTypeEnum | null;
  brand_fk?: string | null;
  source_fk?: string | null;
  name?: string | null;
  description?: string | null;
  status?: StatusEnum | null;
  long_description?: string | null;
  value?: number | null;
  currency?: string | null;
  poynts?: number | null;
  countries?: string[] | null;
  language?: string | null;
  image?: string | null;
  redemption_instructions?: string | null;
  terms?: string | null;
  tags?: string[] | null;
  inventory?: Inventory | null;
  external_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Catalog entity
 */
export interface Catalog {
  id: string;
  name: string;
  description?: string | null;
  organization_fk?: string | null;
  type: CatalogTypeEnum;
  status: CatalogStatusEnum;
  created_at: string;
  updated_at: string;
}

/**
 * Catalog with rewards included
 */
export interface CatalogWithRewards extends Catalog {
  catalogRewards?: CatalogReward[];
}

/**
 * Catalog-Reward junction entity
 */
export interface CatalogReward {
  id: string;
  catalog_fk: string;
  reward_fk: string;
  poynts_override?: number | null;
  status_override?: StatusEnum | null;
  display_order: number;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
  reward?: Reward;
}

/**
 * Catalog list response
 */
export interface CatalogListResponse {
  data: Catalog[];
  limit: number;
  offset: number;
}

/**
 * Catalog detail response (includes rewards)
 */
export interface CatalogDetailResponse {
  data: CatalogWithRewards;
  meta?: {
    timestamp: string;
  };
}

/**
 * Catalog create/update response
 */
export interface CatalogMutationResponse {
  data: Catalog;
  meta?: {
    timestamp: string;
  };
}

/**
 * Reorder rewards request body
 */
export interface ReorderRewardsRequest {
  reward_ids: string[];
}
