import { z } from "zod";

export const updateBrandSchema = z.object({
  brandTag: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  terms: z.string().optional(),
  disclaimer: z.string().optional(),
});

export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
