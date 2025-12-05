/**
 * Member domain response types
 */

import {
  StatusEnum,
  TransactionTypeEnum,
  TierAssignmentTypeEnum,
  TierChangeTypeEnum,
  QualificationSnapshot,
} from "../../_lib/schemas";

/**
 * Member entity
 */
export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  organization_fk: string;
  external_id: string;
  user_fk?: string | null;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
}

/**
 * Member with computed poynts balance
 */
export interface MemberWithPoynts extends Member {
  poynts_total: number;
  poynts_available: number;
}

/**
 * Poynts transaction record
 */
export interface PoyntsTransaction {
  id: string;
  member_fk: string;
  type: TransactionTypeEnum;
  amount: number;
  balance_after: number;
  description: string;
  reference_type?: string | null;
  reference_id?: string | null;
  campaign_fk?: string | null;
  program_fk?: string | null;
  created_at: string;
}

/**
 * Member's current tier assignment
 */
export interface MemberTier {
  id: string;
  member_fk: string;
  program_fk: string;
  tier_definition_fk: string;
  assigned_at: string;
  assignment_type: TierAssignmentTypeEnum;
  assigned_by?: string | null;
  expires_at?: string | null;
  qualification_snapshot?: QualificationSnapshot | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Member tier change history record
 */
export interface MemberTierHistory {
  id: string;
  member_fk: string;
  program_fk: string;
  previous_tier_fk?: string | null;
  new_tier_fk: string;
  change_type: TierChangeTypeEnum;
  change_reason?: string | null;
  changed_by?: string | null;
  effective_date: string;
  created_at: string;
}

/**
 * Member poynts balance response
 */
export interface MemberPoyntsBalance {
  poynts_total: number;
  poynts_available: number;
}

/**
 * Member list response
 */
export interface MemberListResponse {
  data: Member[];
  limit: number;
  offset: number;
}

/**
 * Member detail response
 */
export interface MemberDetailResponse {
  data: MemberWithPoynts;
  meta?: {
    timestamp: string;
  };
}
