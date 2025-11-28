import { z } from "zod";

export const catalogSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_date: z.string(),
  items_total: z.number(),
  client: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export const catalogsSchema = z.array(catalogSchema);

export type Catalog = z.infer<typeof catalogSchema>;

// Extended type for flattened catalog data used in the UI
export type FlattenedCatalog = Catalog & {
  client_name: string;
  client_id: number;
};
