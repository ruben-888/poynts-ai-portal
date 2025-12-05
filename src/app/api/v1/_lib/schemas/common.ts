/**
 * Common/shared types used across multiple domains
 */

import {
  TierQualificationTypeEnum,
  InventoryTypeEnum,
} from "./enums";

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    timestamp?: string;
  };
  error?: {
    statusCode?: number;
    name?: string;
    message?: string;
  };
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  data: T[];
  limit: number;
  offset: number;
  total?: number;
}

/**
 * Inventory configuration for rewards
 */
export interface Inventory {
  type: InventoryTypeEnum;
  available?: number;
}

/**
 * Program eligibility rules
 */
export interface EligibilityRules {
  member_status?: string[];
  min_membership_days?: number;
  geographic_restrictions?: {
    countries?: string[];
    states?: string[];
  };
  custom_rules?: Record<string, unknown>;
}

/**
 * Program earning modifiers
 */
export interface EarningModifiers {
  base_multiplier?: number;
  bonus_poynts?: number;
}

/**
 * Program poynt caps
 */
export interface PoyntCaps {
  max_daily_poynts?: number;
  max_monthly_poynts?: number;
}

/**
 * Tier qualification rules
 */
export interface QualificationRules {
  type: TierQualificationTypeEnum;
  poynts_threshold?: {
    lifetime_poynts?: number;
    rolling_period_poynts?: number;
    rolling_period_days?: number;
  };
  campaign_completions?: number;
  referrals?: number;
  maintain_threshold?: {
    poynts_per_period?: number;
    period_days?: number;
  };
  grace_period_days?: number;
}

/**
 * Tier benefits configuration
 */
export interface TierBenefits {
  earning_multiplier: number;
  bonus_poynts_per_step?: number;
  bonus_poynts_per_campaign?: number;
  exclusive_campaigns?: boolean;
  priority_support?: boolean;
  early_access_rewards?: boolean;
  redemption_discount_percent?: number;
  custom?: Record<string, unknown>;
}

/**
 * Qualification snapshot for member tiers
 */
export interface QualificationSnapshot {
  lifetime_poynts?: number;
  campaign_completions?: number;
  calculated_at: string;
}
