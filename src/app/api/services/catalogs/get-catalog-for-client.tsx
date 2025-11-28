import axios from "axios";
import { db } from "@/utils/db";
import { CatalogResponseSchema } from "@/app/api/clients/(routes)/[client_id]/catalog/schema";

export async function getCatalogForClient(tenantId: number, clientId: number) {
  try {
    const apiHost = process.env.CAREPOYNT_API_HOST;

    if (!apiHost) {
      throw new Error("Missing environment variable: CAREPOYNT_API_HOST");
    }

    // Load credentials from database
    const cpClient = await db.cp_clients.findFirst({
      where: {
        id: tenantId,
      },
      select: {
        client_id: true,
        secret_key: true,
      },
    });

    if (!cpClient) {
      throw new Error("Client credentials not found");
    }

    const response = await axios.get(
      `https://${apiHost}/api/redemptionItems/${clientId}`,
      {
        headers: {
          "Content-Type": "application/json",
          client_id: cpClient.client_id,
          secret_key: cpClient.secret_key,
        },
      },
    );

    // Validate response against expected schema
    const validatedData = CatalogResponseSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    // Sanitize error logging to prevent exposing sensitive information
    if (axios.isAxiosError(error)) {
      console.error("Error fetching catalog from external API:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
    } else {
      console.error(
        "Error fetching catalog from external API:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
    throw new Error("Failed to fetch catalog for client");
  }
}
