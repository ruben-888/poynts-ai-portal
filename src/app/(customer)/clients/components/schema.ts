import { z } from "zod";

export const clientSchema = z.object({
  ent_id: z.string(),
  ent_id_parent: z.string(),
  ent_name: z.string(),
  ent_desc: z.string().nullable(),
  ent_type: z.string(),
  ent_startDate: z.string(),
  ent_status: z.string(),
  ent_phone: z.string().nullable(),
  ent_address: z.string().nullable(),
  ent_city: z.string().nullable(),
  ent_state: z.string().nullable(),
  ent_zip: z.string().nullable(),
  parent_name: z.string().nullable(),
  member_count: z.number().optional(),
  rewards_count: z.number().optional(),
});

export type Client = z.infer<typeof clientSchema>;
export const clientsSchema = z.array(clientSchema);
