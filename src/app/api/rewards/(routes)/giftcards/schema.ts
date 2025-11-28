import { z } from "zod";

// Validation schema for creating a gift card
export const createGiftCardSchema = z.object({
  brand_id: z.number().int().positive(),
  item_id: z.number().int().positive().optional(), // Optional, will be derived from brand_id and value
  cpid: z.string().min(1),
  language: z.string().default("EN"),
  value: z.number().positive(),
  poynts: z.number().int().positive(),
  reward_status: z.enum(["active", "suspended", "inactive"]).default("active"),
  inventory_type: z.enum(["unlimited", "single", "multiple"]).default("unlimited"),
  inventory_remaining: z.number().int().default(0),
  tags: z.string().optional(),
  priority: z.number().int().min(0).max(10).default(1),
  // Auto-enable for specific tenant
  auto_enable_tenant_id: z.number().int().positive().optional(),
});