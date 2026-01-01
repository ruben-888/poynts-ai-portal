/**
 * Reward Types
 *
 * Types for the global rewards catalog
 */

export interface Reward {
  id: string;
  type?: "gift_card" | "offer";
  brand_fk?: string;
  source_fk?: string;
  name?: string;
  description?: string;
  status?: "active" | "inactive" | "pending" | "suspended";
  long_description?: string;
  value?: number;
  currency?: string;
  poynts?: number;
  countries?: string[];
  language?: string;
  image?: string;
  redemption_instructions?: string;
  terms?: string;
  tags?: string[];
  inventory?: {
    type?: "unlimited" | "limited";
    available?: number;
  };
  external_id?: string;
  created_at: string;
  updated_at: string;
  // Relations (included when include_brand/include_source=true)
  brand?: RewardBrand;
  source?: RewardSource;
}

export interface RewardBrand {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status?: string;
}

export interface RewardSource {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

export interface RewardsResponse {
  data: Reward[];
  limit: number;
  offset: number;
  total: number;
}
