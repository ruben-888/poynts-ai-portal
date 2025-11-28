/**
 * CPID transformation utilities
 * Handles CPID parsing and truncation logic
 */

export interface CpidResult {
  /** Original full CPID */
  cpidx: string;
  /** Truncated CPID (first 4 parts) */
  cpid: string;
}

/**
 * Parses and transforms a CPID string
 * - Validates format (must have at least 4 dash-separated parts)
 * - Returns both full CPID (cpidx) and truncated version (cpid)
 *
 * @param cpid - The CPID string to parse (can be null/undefined)
 * @param rewardId - Optional reward ID for logging
 * @returns Object with cpidx (full) and cpid (truncated to 4 parts)
 */
export function parseCpid(
  cpid: string | null | undefined,
  rewardId?: string
): CpidResult {
  // Handle null/undefined CPID
  if (!cpid) {
    return { cpidx: "", cpid: "" };
  }

  // Handle single dash - treat as a valid minimal CPID
  if (cpid === "-") {
    return { cpidx: "-", cpid: "-" };
  }
  
  // Handle empty-like values
  if (cpid.trim() === "") {
    return { cpidx: "", cpid: "" };
  }

  // Validate CPID format
  const cpidParts = cpid.split("-");

  // Ensure we have at least 4 parts for the shortened CPID
  if (cpidParts.length < 4) {
    if (rewardId) {
      console.warn(`Invalid CPID format for reward ${rewardId}: ${cpid}`);
    }
    // Return as-is if format is invalid
    return { cpidx: cpid, cpid };
  }

  return {
    cpidx: cpid, // Keep the original full CPID
    cpid: cpidParts.slice(0, 4).join("-"), // Take first 4 parts for truncated CPID
  };
}
