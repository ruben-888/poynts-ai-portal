import { db } from "@/utils/db";

/**
 * Interface for creating a system activity
 */
export interface CreateSystemActivity {
  type?: string;
  severity?: string;
  description?: string;
  meta_data?: string;
  member_id?: number;
  enterprise_id?: number;
  reward_id?: number;
  reward_type?: string;
  ip_address?: string;
  device_info?: string;
}

/**
 * Log a single system activity
 *
 * @param activityData - Object containing the activity data to be logged
 * @returns Promise<number> - ID of the created activity record
 */
export async function logSystemActivity(
  activityData: CreateSystemActivity
): Promise<number> {
  try {
    // Create the system activity record
    const result = await db.system_activity.create({
      data: {
        type: activityData.type || null,
        severity: activityData.severity || null,
        description: activityData.description || null,
        meta_data: activityData.meta_data || null,
        member_id: activityData.member_id || null,
        enterprise_id: activityData.enterprise_id || null,
        reward_id: activityData.reward_id || null,
        reward_type: activityData.reward_type || null,
        ip_address: activityData.ip_address || null,
        device_info: activityData.device_info || null,
        // activity_date will be set to current timestamp by default as defined in the schema
      },
    });

    return result.id;
  } catch (error) {
    console.error("Error logging system activity:", error);
    throw new Error("Failed to log system activity");
  }
}

/**
 * Generic function to log any arbitrary activity
 *
 * @param type - The type of activity (e.g., "user_action", "system_event", "notification")
 * @param description - Description of the activity
 * @param options - Additional options to further customize the activity log
 * @returns Promise<number> - ID of the created activity record
 */
export async function logActivity(
  type: string,
  description: string,
  options?: {
    severity?: "info" | "warning" | "error" | string;
    meta_data?: Record<string, any> | string;
    member_id?: number;
    enterprise_id?: number;
    reward_id?: number;
    reward_type?: string;
    ip_address?: string;
    device_info?: string;
  }
): Promise<number> {
  // Process meta_data if it's an object
  let metaDataString: string | undefined;
  if (options?.meta_data) {
    metaDataString =
      typeof options.meta_data === "string"
        ? options.meta_data
        : JSON.stringify(options.meta_data);
  }

  return logSystemActivity({
    type,
    description,
    severity: options?.severity || "info",
    meta_data: metaDataString,
    member_id: options?.member_id,
    enterprise_id: options?.enterprise_id,
    reward_id: options?.reward_id,
    reward_type: options?.reward_type,
    ip_address: options?.ip_address,
    device_info: options?.device_info,
  });
}

/**
 * Utility functions for common system activity logging scenarios
 */

/**
 * Log a member login activity
 */
export async function logMemberLogin(
  memberId: number,
  ipAddress?: string,
  deviceInfo?: string
): Promise<number> {
  return logSystemActivity({
    type: "authentication",
    severity: "info",
    description: "Member login successful",
    member_id: memberId,
    ip_address: ipAddress,
    device_info: deviceInfo,
  });
}

/**
 * Log a reward redemption activity
 */
export async function logRewardRedemption(
  memberId: number,
  rewardId: number,
  rewardType: string,
  enterpriseId?: number,
  ipAddress?: string
): Promise<number> {
  return logSystemActivity({
    type: "redemption",
    severity: "info",
    description: `Reward redemption of type ${rewardType}`,
    member_id: memberId,
    enterprise_id: enterpriseId,
    reward_id: rewardId,
    reward_type: rewardType,
    ip_address: ipAddress,
  });
}

/**
 * Log a security-related activity
 */
export async function logSecurityActivity(
  description: string,
  severity: "info" | "warning" | "error",
  memberId?: number,
  ipAddress?: string,
  metaData?: string
): Promise<number> {
  return logSystemActivity({
    type: "security",
    severity,
    description,
    member_id: memberId,
    ip_address: ipAddress,
    meta_data: metaData,
  });
}

/**
 * Log an error activity
 */
export async function logErrorActivity(
  description: string,
  metaData?: string,
  memberId?: number
): Promise<number> {
  return logSystemActivity({
    type: "error",
    severity: "error",
    description,
    meta_data: metaData,
    member_id: memberId,
  });
}
