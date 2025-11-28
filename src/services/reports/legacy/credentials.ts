import { db } from "@/utils/db";

/**
 * Credential type definition
 * Represents a credential with type and value
 */
export type Credential = {
  type: "primary" | "backup";
  value: string;
  obfuscatedValue: string;
};

/**
 * Response type for credential service
 */
export type CredentialsResponse = {
  data: Credential[];
  error?: string;
};

/**
 * Obfuscates a string by showing first and last 4 characters
 * and replacing middle characters with dots
 *
 * @param str - String to obfuscate
 * @returns Obfuscated string
 */
function obfuscateString(str: string): string {
  if (!str) return "";
  if (str.length <= 8) return str; // Don't obfuscate very short strings

  const firstFour = str.substring(0, 4);
  const lastFour = str.substring(str.length - 4);
  const middleDots = "•".repeat(Math.min(str.length - 8, 12)); // Cap at 12 dots max

  return `${firstFour}${middleDots}${lastFour}`;
}

/**
 * Service to retrieve client credentials from the database
 * Fetches primary and backup credentials for a specific client
 *
 * @param clientName - Name of the client to fetch credentials for
 * @returns Promise with credentials response
 */
export async function getClientCredentials(
  clientName: string,
): Promise<CredentialsResponse> {
  try {
    // Query the cp_clients table for the specified client
    const client = await db.cp_clients.findFirst({
      where: {
        name: clientName,
      },
      select: {
        secret_key: true,
        secret_key_backup: true,
      },
    });

    // Handle client not found
    if (!client) {
      return {
        data: [],
        error: "Client not found",
      };
    }

    const primaryValue = client.secret_key;
    const backupValue = client.secret_key_backup || "";

    // Return credentials as primary and backup
    return {
      data: [
        {
          type: "primary",
          value: primaryValue,
          obfuscatedValue: obfuscateString(primaryValue),
        },
        {
          type: "backup",
          value: backupValue,
          obfuscatedValue: obfuscateString(backupValue),
        },
      ],
    };
  } catch (error) {
    console.error(
      `Error fetching credentials for client ${clientName}:`,
      error,
    );
    return {
      data: [],
      error: "Failed to fetch credentials",
    };
  }
}

/**
 * Specifically retrieves Welldot client credentials
 * Used for the credentials API endpoint
 *
 * @returns Promise with Welldot credentials
 */
export async function getWelldotCredentials(): Promise<CredentialsResponse> {
  return getClientCredentials("welldot");
}
