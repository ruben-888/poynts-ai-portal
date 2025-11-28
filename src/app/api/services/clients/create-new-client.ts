import { db } from "@/utils/db";
import { logActivity } from "../../sytem-activity/services/create-single-activity";
import { UserContext } from "../../_shared/types";

export interface CreateClientData {
  ent_name: string;
  ent_desc?: string;
  ent_status?: string;
  ent_id_parent?: string | null;
}

export async function createNewClient(
  data: CreateClientData,
  userContext?: UserContext
) {
  // Basic validation
  if (!data.ent_name || data.ent_name.trim() === "") {
    throw new Error("Client name is required");
  }

  // Create new client using Prisma - only include fields used in the form
  const newClient = await db.enterprise.create({
    data: {
      ent_name: data.ent_name,
      ent_desc: data.ent_desc || "",
      ent_status: data.ent_status || "active",
      ent_id_parent:
        data.ent_id_parent && data.ent_id_parent !== "none"
          ? parseInt(data.ent_id_parent, 10)
          : null,
      ent_type: "client", // Default type
      ent_startDate: new Date(),
    },
  });

  // Prepare metadata with user info and client creation details
  const metadata: Record<string, any> = {
    client: {
      client_id: newClient.ent_id,
      client_name: newClient.ent_name,
      client_status: newClient.ent_status,
      parent_id: newClient.ent_id_parent,
    },
  };

  // Add user info to metadata if available
  if (userContext) {
    metadata.user = {
      userId: userContext.userId,
      userIdExternal: userContext.userIdExternal,
      actor: userContext.actor,
      firstName: userContext.firstName,
      lastName: userContext.lastName,
      fullName: userContext.fullName,
      primaryEmail: userContext.primaryEmail,
      orgRole: userContext.orgRole,
      orgName: userContext.orgName,
      orgSlug: userContext.orgSlug,
    };
  }

  // Log the client creation activity
  await logActivity("client.create", `Client created: ${newClient.ent_name}`, {
    severity: "info",
    enterprise_id: newClient.ent_id,
    meta_data: metadata,
  });

  return newClient;
}
