import { GroupedReward } from "@/app/api/rewards/types";

// Define catalog membership interface
export interface CatalogMembership {
  catalog_id: number;
  catalog_name: string;
  enterprise_id: number;
  enterprise_name: string;
  display_order?: number;
}

// Define GroupedReward interface with catalogs - extends the base GroupedReward
export interface GroupedRewardWithCatalogs extends Omit<GroupedReward, 'tenant_id'> {
  catalogs: CatalogMembership[];
}

// API Response interface
export interface RewardsApiResponse {
  success?: boolean;
  data: GroupedRewardWithCatalogs[];
}

// Filter option interface
export interface FilterOption {
  value: string;
  label: string;
}

// Enterprise interface for filters
export interface Enterprise {
  id: number;
  name: string;
}
