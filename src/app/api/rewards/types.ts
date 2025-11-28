import { UserContext } from "../_shared/types";

export type { UserContext };

export interface GiftCardUpdateData {
  item_id?: number;
  value?: number;
  redem_value?: number;
  inventory_type?: string;
  inventory_remaining?: number;
  language?: string | null;
  tags?: string | null;
  cpid?: string | null;
  priority?: number | null;
  custom_title?: string | null;
  reward_status?: string | null;
}

export interface RedemptionItemUpdateData {
  brand_id?: number;
  provider_id?: number | null;
  utid?: string | null;
  rewardName?: string | null;
  currencyCode?: string | null;
  status?: string | null;
  reward_status?: string | null;
  reward_availability?: string | null;
  valueType?: string | null;
  rewardType?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  redemptionInstructions?: string | null;
  rebate_provider_percentage?: number | null;
  rebate_base_percentage?: number | null;
  rebate_customer_percentage?: number | null;
  rebate_cp_percentage?: number | null;
  notes?: string | null;
}

export interface OfferUpdateData {
  cpid?: string | null;
  title?: string | null;
  brandName?: string | null;
  value?: string | null;
  redem_value?: number | null;
  reward_status?: string | null;
  reward_availability?: string | null;
  is_active?: number;
  is_deleted?: number;
  tags?: string | null;
  imageUrl?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  instructions?: string | null;
  terms?: string | null;
  disclaimer?: string | null;
  language?: string | null;
  redem_url?: string | null;
  custom_id?: string | null;
  rebate_value?: number | null;
  startdate?: Date | null;
  enddate?: Date | null;
  inventory_type?: string | null;
  inventory_remaining?: number | null;
  redem_code_type?: string | null;
  updated_at?: Date;
}

// Reward item interface for individual items within a grouped reward
export interface RewardItem {
  redemption_registries_id: number | null;
  tenant_id: string;
  redemption_id: string | number;
  cpid: string;
  redemption_type: string;
  value: number | string;
  poynts: number | string;
  redem_value?: number;
  name: string | null;
  inventory_remaining: number;
  title: string;
  startdate?: string;
  enddate?: string;
  reward_status: string;
  language: string;
  reward_availability: string;
  utid?: string;
  value_type?: string;
  tags?: string | null;
  priority: number;
  provider_id?: number;
  cpidx: string;
  type: string;
  reward_image?: string;
  source_letter?: string;
  latency?: string | number;
  description?: string;
  disclaimer?: string;
  terms?: string;
}

// Main grouped reward interface
export interface GroupedReward {
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
  tags?: string | null;
  startdate?: string;
  enddate?: string;
  is_enabled: boolean;
  value_type?: string;
  description?: string;
  disclaimer?: string;
  terms?: string;
  items: RewardItem[];
}
