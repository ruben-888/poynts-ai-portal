/**
 * Client Widget Configuration Registry
 *
 * Each client has their own directory with:
 * - index.ts: Main configuration (domains, which widgets on which pages)
 * - widgets/: Individual widget files
 *
 * To add a new client:
 * 1. Create a new directory: clients/[client-name]/
 * 2. Add index.ts with ClientConfig export
 * 3. Add widgets/ subdirectory with widget files
 * 4. Import and register in CLIENTS array below
 * 5. Add domain to chrome-extension/manifest.json
 */

import { ClientConfig } from "./types";
import { twinProtocolConfig } from "./twinprotocol";
// Import additional client configs here:
// import { acmeHealthConfig } from "./acme-health";

// Re-export types for convenience
export type { Widget, ClientConfig } from "./types";

/**
 * Registry of all client configurations
 * Add new clients here after creating their directory
 */
const CLIENTS: ClientConfig[] = [
  twinProtocolConfig,
  // Add more clients here:
  // acmeHealthConfig,
];

/**
 * Find the client configuration for a given domain
 */
export function getClientConfig(domain: string): ClientConfig | null {
  // Normalize domain (remove www. prefix for matching)
  const normalizedDomain = domain.replace(/^www\./, "");

  for (const client of CLIENTS) {
    const matchesDomain = client.domains.some((d) => {
      const normalizedClientDomain = d.replace(/^www\./, "");
      return (
        normalizedClientDomain === normalizedDomain ||
        normalizedClientDomain === domain
      );
    });

    if (matchesDomain) {
      return client;
    }
  }

  return null;
}

/**
 * Get all registered domains (for manifest.json generation)
 */
export function getAllDomains(): string[] {
  const domains = new Set<string>();
  for (const client of CLIENTS) {
    for (const domain of client.domains) {
      domains.add(domain);
    }
  }
  return Array.from(domains);
}
