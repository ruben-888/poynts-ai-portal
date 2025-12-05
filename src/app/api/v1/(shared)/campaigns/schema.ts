/**
 * Campaign domain response types
 */

import {
  CampaignTypeEnum,
  CampaignStatusEnum,
  StepActionTypeEnum,
  ProgressStatusEnum,
} from "../../_lib/schemas";

/**
 * Campaign entity
 */
export interface Campaign {
  id: string;
  organization_fk: string;
  program_fk?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  type: CampaignTypeEnum;
  status: CampaignStatusEnum;
  total_poynts: number;
  image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  max_participants?: number | null;
  requires_verification: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Campaign with steps included
 */
export interface CampaignWithSteps extends Campaign {
  steps?: CampaignStep[];
}

/**
 * Campaign step entity
 */
export interface CampaignStep {
  id: string;
  campaign_fk: string;
  name: string;
  description?: string | null;
  step_order: number;
  poynts: number;
  action_type: StepActionTypeEnum;
  action_config?: Record<string, unknown> | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Member's progress in a campaign
 */
export interface MemberCampaignProgress {
  id: string;
  member_fk: string;
  campaign_fk: string;
  status: ProgressStatusEnum;
  poynts_earned: number;
  completed_steps: number;
  total_steps: number;
  enrolled_at: string;
  completed_at?: string | null;
  last_activity_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Member's completion of a campaign step
 */
export interface MemberStepCompletion {
  id: string;
  member_fk: string;
  campaign_step_fk: string;
  progress_fk: string;
  poynts_awarded: number;
  completion_data?: Record<string, unknown> | null;
  verified_at?: string | null;
  verified_by?: string | null;
  completed_at: string;
}

/**
 * Campaign list response
 */
export interface CampaignListResponse {
  data: Campaign[];
  limit: number;
  offset: number;
}

/**
 * Campaign detail response (includes steps)
 */
export interface CampaignDetailResponse {
  data: CampaignWithSteps;
  meta?: {
    timestamp: string;
  };
}

/**
 * Campaign step list response
 */
export interface CampaignStepListResponse {
  data: CampaignStep[];
  limit: number;
  offset: number;
}

/**
 * Enrollment response
 */
export interface EnrollmentResponse {
  data: MemberCampaignProgress;
  meta?: {
    timestamp: string;
  };
}

/**
 * Step completion response
 */
export interface StepCompletionResponse {
  data: MemberStepCompletion;
  meta?: {
    timestamp: string;
  };
}
