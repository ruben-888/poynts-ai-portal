import { z } from "zod";

// Helper function to decode and validate content length
const validateDecodedLength = (maxLength: number, fieldName: string) => {
  return (val: string | undefined) => {
    if (val === undefined || val === "") return true;
    try {
      const decoded = decodeURIComponent(val);
      return decoded.length <= maxLength;
    } catch {
      // If decoding fails, validate the raw string
      return val.length <= maxLength;
    }
  };
};

const baseSchema = z.object({
  cpidx: z.string().max(100).optional(),
  poynts: z.preprocess((v) => (v === "" ? undefined : v), z.number().nonnegative().optional()),
  title: z.string().max(80).optional(),
  value: z.preprocess((v) => (v === "" ? undefined : v), z.union([z.string(), z.number()]).optional()),
  // Unified status field for frontend
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  // Legacy individual fields (kept for backward compatibility)
  reward_status: z.enum(["active", "inactive", "archived", "suspended"]).optional(),
  reward_availability: z.enum(["AVAILABLE", "UNAVAILABLE", "unknown", "mixed"]).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  brand_name: z.string().max(100).optional(),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  shortDescription: z.string().optional().refine(
    validateDecodedLength(255, "shortDescription"),
    { message: "Short description must be 255 characters or less" }
  ),
  longDescription: z.string().optional().refine(
    validateDecodedLength(8000, "longDescription"),
    { message: "Long description must be 8000 characters or less" }
  ),
  instructions: z.string().optional().refine(
    validateDecodedLength(255, "instructions"),
    { message: "Instructions must be 255 characters or less" }
  ),
  terms: z.string().optional().refine(
    validateDecodedLength(8000, "terms"),
    { message: "Terms must be 8000 characters or less" }
  ),
  disclaimer: z.string().optional().refine(
    validateDecodedLength(8000, "disclaimer"),
    { message: "Disclaimer must be 8000 characters or less" }
  ),
  language: z.string().max(20).optional(),
  redemptionUrl: z.union([z.string().url(), z.literal("")]).optional(),
  customId: z.string().max(100).optional(),
  rebateValue: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.number().optional()),
  startDate: z.union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).optional(),
  endDate: z.union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).optional(),
  inventoryType: z.enum(["single", "multiple", "unlimited"]).optional(),
  limitType: z.enum(["limited", "unlimited"]).optional(),
  usageLimit: z.preprocess((v) => (v === "" ? undefined : v), z.number().int().nonnegative().optional()),
  singleCode: z.string().optional(),
  multipleCodes: z.string().optional(),
  is_enabled: z.boolean().optional(),
});

export const offerCreateSchema = baseSchema.extend({
  title: z.string().max(80),
  brand_name: z.string().max(100),
  poynts: z.preprocess((v) => (v === "" ? undefined : v), z.number().nonnegative()),
  value: z.preprocess((v) => (v === "" ? undefined : v), z.union([z.string(), z.number()])),
  // On creation, suspended is not allowed
  status: z.enum(["active", "inactive"]).optional(),
});

export const offerUpdateSchema = baseSchema; 
