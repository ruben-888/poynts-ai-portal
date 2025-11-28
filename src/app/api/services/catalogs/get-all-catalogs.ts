import { db } from "@/utils/db";

export interface CatalogData {
  client: {
    id: number;
    name: string;
  };
  id: number;
  name: string;
  created_date: string;
  items_total: number;
}

export async function getAllCatalogs(): Promise<CatalogData[]> {
  // Using Prisma relationships to replicate the SQL query:
  // SELECT e.ent_id AS ent_id,
  //        e.ent_name AS ent_name,
  //        rrg.id AS registry_id,
  //        rrg.name AS registry_name,
  //        rrg.created_date AS created_date,
  //        COUNT(rr.redemption_id) AS registry_items
  // FROM redemption_registry_groups AS rrg
  // JOIN enterprise AS e ON rrg.ent_id = e.ent_id
  // LEFT JOIN redemption_registries AS rr ON rrg.id = rr.registry_group_id
  // WHERE rrg.deleted_date IS NULL
  // GROUP BY registry_id;

  const registryGroups = await db.redemption_registry_groups.findMany({
    where: {
      deleted_date: null,
    },
    include: {
      enterprise: {
        select: {
          ent_id: true,
          ent_name: true,
        },
      },
      redemption_registries: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      enterprise: {
        ent_name: "asc",
      },
    },
  });

  // Format the data to match the expected response format
  return registryGroups.map((group) => ({
    id: group.id,
    name: group.name || "",
    items_total: group.redemption_registries.length,
    client: {
      id: group.enterprise.ent_id,
      name: group.enterprise.ent_name || `Client ${group.enterprise.ent_id}`,
    },
    created_date: group.created_date ? group.created_date.toISOString() : "",
  }));
}
