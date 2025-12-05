/**
 * Program domain response types
 */

import {
  ProgramStatusEnum,
  EligibilityRules,
  EarningModifiers,
  PoyntCaps,
  QualificationRules,
  TierBenefits,
} from "../../_lib/schemas";

/**
 * Program entity
 */
export interface Program {
  id: string;
  organization_fk: string;
  name: string;
  slug: string;
  description?: string | null;
  status: ProgramStatusEnum;
  start_date?: string | null;
  end_date?: string | null;
  eligibility_rules?: EligibilityRules | null;
  earning_modifiers?: EarningModifiers | null;
  poynt_caps?: PoyntCaps | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Program with tier definitions included
 */
export interface ProgramWithTiers extends Program {
  tiers?: TierDefinition[];
}

/**
 * Tier definition entity
 */
export interface TierDefinition {
  id: string;
  program_fk: string;
  name: string;
  slug: string;
  level: number;
  description?: string | null;
  qualification_rules: QualificationRules;
  benefits: TierBenefits;
  color?: string | null;
  icon_url?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Program list response
 */
export interface ProgramListResponse {
  data: Program[];
  limit: number;
  offset: number;
}

/**
 * Program detail response (includes tiers)
 */
export interface ProgramDetailResponse {
  data: ProgramWithTiers;
  meta?: {
    timestamp: string;
  };
}

/**
 * Tier definition list response
 */
export interface TierDefinitionListResponse {
  data: TierDefinition[];
  limit: number;
  offset: number;
}
