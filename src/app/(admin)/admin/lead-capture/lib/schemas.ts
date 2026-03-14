import { z } from "zod";

/**
 * Lead Capture Pipeline Config schema
 * Mirrors LeadCaptureDbConfig from backend
 */
export const LeadCaptureConfigSchema = z.object({
  enabled: z.boolean(),
  ai_model: z.string().min(1, "AI model is required"),
  tango_etid: z.string().min(1, "Tango ETID is required"),
  reward_amount: z.coerce.number().min(0, "Must be >= 0"),
  delivery_method: z.enum(["PHONE", "EMAIL"]),
  persona_email_enabled: z.boolean(),
  default_test_mode: z.boolean(),
  allow_duplicates: z.boolean(),
  linkedin_enrichment_enabled: z.boolean().optional(),
  linkedin_search_timeout: z.coerce.number().min(0).optional(),
});

export type LeadCaptureConfig = z.infer<typeof LeadCaptureConfigSchema>;

/**
 * Available Reward schema
 */
export const AvailableRewardSchema = z.object({
  utid: z.string().min(1, "UTID is required"),
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type AvailableReward = z.infer<typeof AvailableRewardSchema>;

/**
 * Prompt Template schema
 */
export const PromptTemplateSchema = z.object({
  system: z.string().min(1, "System prompt is required"),
  user: z.string().min(1, "User prompt is required"),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

/**
 * Lead Capture Log type (read-only, no validation needed)
 */
export interface LeadCaptureLog {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  webhook_payload?: object;
  preferences?: object;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  submitted_at?: string;
  ai_model?: string;
  ai_prompt_input?: object;
  ai_prompt_output?: object;
  ai_top_pick_utid?: string;
  ai_top_pick_name?: string;
  ai_top_pick_score?: number;
  ai_top_pick_reason?: string;
  ai_ranked_list?: Array<{
    utid: string;
    name: string;
    score: number;
    reason: string;
  }>;
  ai_processing_time_ms?: number;
  tango_order_id?: string;
  tango_order_status?: string;
  tango_amount?: number;
  tango_utid?: string;
  tango_delivery_status?: string;
  tango_response?: object;
  tango_error?: string;
  archetype_name?: string;
  archetype_code?: string;
  archetype_scores?: Record<string, number>;
  persona_email_status?: string;
  persona_email_message_id?: string;
  persona_email_error?: string;
  persona_email_sent_at?: string;
  linkedin_enriched?: boolean;
  linkedin_context?: string;
  status: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}
