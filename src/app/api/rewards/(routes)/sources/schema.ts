import { z } from "zod";

export const sourcesRequestSchema = z.object({
  cpids: z.array(z.string()).min(1, "At least one CPID is required"),
});

export const sourceInfoSchema = z.object({
  source_letter: z.string(),
  status: z.enum(["active", "suspended", "inactive"]),
  provider_id: z.number().nullable(),
  reward_availability: z.string(),
  cpidx: z.string(),
});

export const sourcesItemSchema = z.object({
  cpid: z.string(),
  sources: z.array(sourceInfoSchema),
});

export const sourcesResponseSchema = z.object({
  sources: z.array(sourcesItemSchema),
});

export type SourcesRequest = z.infer<typeof sourcesRequestSchema>;
export type SourceInfo = z.infer<typeof sourceInfoSchema>;
export type SourcesItem = z.infer<typeof sourcesItemSchema>;
export type SourcesResponse = z.infer<typeof sourcesResponseSchema>;
