/**
 * Reward domain response types
 */

import { RewardTypeEnum, StatusEnum, Inventory } from "../../_lib/schemas";

/**
 * Reward entity
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
 * Reward with brand included
 */
export interface RewardWithBrand extends Reward {
  brand?: RewardBrand | null;
}

/**
 * Reward brand entity
 */
export interface RewardBrand {
  id: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Reward source entity
 */
export interface RewardSource {
  id: string;
  name: string;
  description?: string | null;
  api_base_url?: string | null;
  status: StatusEnum;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Reward source item entity
 */
export interface RewardSourceItem {
  id: string;
  source_fk: string;
  source_identifier: string;
  reward_fk?: string | null;
  priority: number;
  raw_data?: Record<string, unknown> | null;
  status: StatusEnum;
  last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Reward detail response
 */
export interface RewardDetailResponse {
  data: RewardWithBrand;
  meta?: {
    timestamp: string;
  };
}
