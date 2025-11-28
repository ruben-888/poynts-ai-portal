import { db } from "@/utils/db";
import { logActivity } from "../../sytem-activity/services/create-single-activity";
import { UserContext } from "../../_shared/types";

export interface UpdateClientData {
  ent_id: string;
  ent_name?: string;
  ent_desc?: string;
  ent_status?: string;
  ent_id_parent?: string | null;
}

export async function updateSingleClient(
  data: UpdateClientData,
  userContext?: UserContext
) {
  // Ensure ent_id exists for update
  if (!data.ent_id) {
    throw new Error("Client ID is required for updates");
  }

  // Update client using Prisma
  const updatedClient = await db.enterprise.update({
    where: {
      ent_id: parseInt(data.ent_id, 10),
    },
    data: {
      ...(data.ent_name && { ent_name: data.ent_name }),
      ...(data.ent_desc !== undefined && { ent_desc: data.ent_desc }),
      ...(data.ent_status && { ent_status: data.ent_status }),
      ...(data.ent_id_parent !== undefined && {
        ent_id_parent: data.ent_id_parent
          ? parseInt(data.ent_id_parent, 10)
          : null,
      }),
    },
  });

  // Prepare metadata with user info and client update details
  const metadata: Record<string, any> = {
    client: {
      client_id: updatedClient.ent_id,
      updated_fields: Object.keys(data).filter((key) => key !== "ent_id"),
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

  // Log the client update activity
  await logActivity(
    "client.update",
    `Client updated: ${updatedClient.ent_name}`,
    {
      severity: "info",
      enterprise_id: updatedClient.ent_id,
      meta_data: metadata,
    }
  );

  return updatedClient;
}
