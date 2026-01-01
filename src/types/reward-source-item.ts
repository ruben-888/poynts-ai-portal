/**
 * Reward Source Item Types
 *
 * Types for the unified source items view across all reward providers
 * (Tremendous, Tango, Blackhawk, etc.)
 */

export interface RewardSourceItem {
  id: string;
  source_fk: string;
  source_identifier: string;
  reward_fk?: string;
  priority: number;
  raw_data?: Record<string, unknown>;
  status: "active" | "inactive" | "pending" | "suspended";
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
  // Relations (included when include_source/include_reward=true)
  source?: RewardSource;
  reward?: Reward;
}

export interface RewardSource {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export interface Reward {
  id: string;
  name?: string;
  brand_fk?: string;
  status?: string;
}

export interface RewardSourceItemsResponse {
  data: RewardSourceItem[];
  limit: number;
  offset: number;
  total: number;
}
