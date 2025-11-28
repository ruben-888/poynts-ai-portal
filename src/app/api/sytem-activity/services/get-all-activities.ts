import { db } from "@/utils/db";

/**
 * Interface for user metadata structure from meta_data field
 */
export interface UserMetadata {
  user?: {
    userId?: string;
    userIdExternal?: string;
    actor?: any;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    primaryEmail?: string;
    orgRole?: string;
    orgName?: string;
    orgSlug?: string;
  };
  [key: string]: any; // For other module-specific metadata
}

/**
 * Interface for system activity data
 */
export interface SystemActivity {
  type: string | null;
  severity: string | null;
  description: string | null;
  member_id: number | null;
  enterprise_id: number | null;
  reward_id: number | null;
  reward_type: string | null;
  ip_address: string | null;
  device_info: string | null;
  activity_date: string;
  member_name: string | null;
  user_metadata?: UserMetadata | null; // Add user metadata for hover display
}

/**
 * Fetch system activity data
 *
 * @param limit - Maximum number of records to return (default: 100)
 * @param offset - Number of records to skip (default: 0)
 * @returns Promise<SystemActivity[]> - Array of system activity records
 */
export async function getSystemActivity(
  limit: number = 100,
  offset: number = 0
): Promise<SystemActivity[]> {
  try {
    // Query the system_activity table using db
    const activities = await db.system_activity.findMany({
      select: {
        type: true,
        severity: true,
        description: true,
        member_id: true,
        enterprise_id: true,
        reward_id: true,
        reward_type: true,
        ip_address: true,
        device_info: true,
        activity_date: true,
        meta_data: true, // Include meta_data to extract user information
      },
      orderBy: {
        activity_date: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Format the activity_date and extract member_name from metadata
    return activities.map((activity) => {
      // Parse meta_data to extract user information
      let memberName: string | null = null;
      let userMetadata: UserMetadata | null = null;

      if (activity.meta_data) {
        try {
          const metadata: UserMetadata = JSON.parse(activity.meta_data);
          // Extract full name from metadata.user.fullName
          if (metadata.user?.fullName) {
            memberName = metadata.user.fullName;
          }
          // Store the full user metadata for hover display
          userMetadata = metadata;
        } catch (error) {
          console.warn(
            "Failed to parse meta_data for activity:",
            activity.member_id,
            error
          );
        }
      }

      // Fallback to legacy logic if no metadata user found (for older records)
      if (!memberName && activity.member_id === 1) {
        memberName = "Well Admin";
      }

      return {
        type: activity.type,
        severity: activity.severity,
        description: activity.description,
        member_id: activity.member_id,
        enterprise_id: activity.enterprise_id,
        reward_id: activity.reward_id,
        reward_type: activity.reward_type,
        ip_address: activity.ip_address,
        device_info: activity.device_info,
        activity_date: activity.activity_date
          ? activity.activity_date
              .toISOString()
              .replace("T", " ")
              .substring(0, 19)
          : new Date().toISOString().replace("T", " ").substring(0, 19),
        member_name: memberName, // Use extracted user name from metadata
        user_metadata: userMetadata, // Include parsed user metadata
      };
    });
  } catch (error) {
    console.error("Error fetching system activity:", error);
    throw new Error("Failed to fetch system activity data");
  }
}
