// Status mapping utilities for offers

export type FrontendStatus = "active" | "inactive" | "suspended";
export type DatabaseStatus = "active" | "inactive" | "suspended" | "archived";

export interface StatusMapping {
  is_deleted?: number;
  is_active?: number;
  reward_status?: DatabaseStatus;
}

/**
 * Maps frontend status to database field values
 */
export function mapStatusToDbFields(status: FrontendStatus): StatusMapping {
  console.log(`[mapStatusToDbFields] Mapping status: ${status}`);
  
  let mapping: StatusMapping;
  switch (status) {
    case "active":
      mapping = {
        is_deleted: 0,
        is_active: 1,
        reward_status: "active"
      };
      break;
    case "inactive":
      mapping = {
        is_active: 0,
        reward_status: "inactive"
        // is_deleted unchanged
      };
      break;
    case "suspended":
      mapping = {
        is_active: 0,
        reward_status: "suspended"
        // is_deleted unchanged
      };
      break;
    default:
      throw new Error(`Invalid status: ${status}`);
  }
  
  console.log(`[mapStatusToDbFields] Result mapping:`, mapping);
  return mapping;
}

/**
 * Computes frontend status from database field values
 */
export function computeStatusFromDbFields(
  is_active: number,
  reward_status: string | null,
  is_deleted: number = 0
): FrontendStatus {
  // If deleted, don't show it at all (this shouldn't happen in normal queries)
  if (is_deleted === 1) {
    throw new Error("Deleted offers should not be displayed");
  }

  // Check reward_status first for suspended status (takes priority)
  if (reward_status === "suspended") {
    return "suspended";
  }

  // If active and reward_status is active
  if (is_active === 1 && reward_status === "active") {
    return "active";
  }

  // If inactive or any other combination
  if (is_active === 0) {
    return "inactive";
  }

  // Default fallback for any other combinations
  return "inactive";
}

/**
 * Validates if a status transition is allowed
 */
export function validateStatusTransition(
  newStatus: FrontendStatus,
  isCreation: boolean = false
): { valid: boolean; error?: string } {
  // On creation, suspended is not allowed
  if (isCreation && newStatus === "suspended") {
    return {
      valid: false,
      error: "Status 'suspended' can only be set after offer creation, not during creation"
    };
  }

  // All other transitions are allowed
  return { valid: true };
}

/**
 * Applies status mapping to an update object, only including changed fields
 */
export function applyStatusMapping(
  status: FrontendStatus,
  updateData: Record<string, any>
): void {
  console.log(`[applyStatusMapping] Applying status: ${status} to updateData:`, updateData);
  
  const mapping = mapStatusToDbFields(status);
  
  // Only add fields that have values (undefined means no change)
  Object.entries(mapping).forEach(([key, value]) => {
    if (value !== undefined) {
      console.log(`[applyStatusMapping] Setting ${key} = ${value}`);
      updateData[key] = value;
    }
  });
  
  console.log(`[applyStatusMapping] Final updateData:`, updateData);
}