import { headers } from "next/headers";
import { currentUser, auth } from "@clerk/nextjs/server";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";

interface UserLoginMetadata {
  user: {
    userId: string;
    userIdExternal: string;
    firstName: string;
    lastName: string;
    fullName: string;
    primaryEmail: string;
    orgRole?: string;
    orgName?: string;
    orgSlug?: string;
  };
  session: {
    sessionId?: string;
    deviceInfo?: string;
    userAgent?: string;
    ipAddress?: string;
    isNewSession: boolean;
  };
}

/**
 * Tracks user login events.
 */
export async function trackUserLogin(): Promise<void> {
  try {
    const user = await currentUser();
    const { sessionClaims, orgRole, orgSlug } = await auth();

    // console.log('Starting user login tracking');
    if (!user) {
      return;
    }

    // console.log('User found:', user);
    // Get request headers for IP and user agent
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = 
      forwarded?.split(",")?.[0]?.trim() || 
      headersList.get("x-real-ip") || 
      headersList.get("remote-addr") || 
      undefined;

    // Extract device info from user agent
    const deviceInfo = userAgent ? extractDeviceInfo(userAgent) : undefined;

    // Create metadata for the login event
    const metadata: UserLoginMetadata = {
      user: {
        userId: user.id,
        userIdExternal: user.externalId || user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        primaryEmail: user.primaryEmailAddress?.emailAddress || "",
        orgRole: orgRole || undefined,
        orgName: sessionClaims?.orgName as string || undefined,
        orgSlug: orgSlug || undefined,
      },
      session: {
        sessionId: sessionClaims?.sid as string || undefined,
        deviceInfo,
        userAgent,
        ipAddress,
        isNewSession: true,
      },
    };

    // console.log('Metadata:', metadata);

    // Log the user login activity
    await logActivity(
      "user.login",
      `User login: ${metadata.user.fullName || metadata.user.primaryEmail}`,
      {
        severity: "info",
        meta_data: metadata,
        ip_address: ipAddress,
        device_info: deviceInfo,
      }
    );

    // console.log(`User login logged: ${user.id} (${metadata.user.primaryEmail})`);
  } catch (error) {
    console.error("Error tracking user login:", error);
    // Don't throw error to avoid breaking the user experience
  }
}

/**
 * Extracts simplified device information from user agent string
 */
function extractDeviceInfo(userAgent: string): string {
  // Simple device detection
  if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
    return "Mobile";
  }
  if (userAgent.includes("iPad") || userAgent.includes("Tablet")) {
    return "Tablet";
  }
  if (userAgent.includes("Macintosh")) {
    return "Mac Desktop";
  }
  if (userAgent.includes("Windows")) {
    return "Windows Desktop";
  }
  if (userAgent.includes("Linux")) {
    return "Linux Desktop";
  }
  return "Desktop";
}

/**
 * Alternative function for more detailed logging if needed in the future
 * This could be used with webhooks or more sophisticated session tracking
 */
export async function logDetailedUserLogin(additionalContext?: Record<string, any>): Promise<void> {
  try {
    const user = await currentUser();
    const { sessionClaims, orgRole, orgSlug } = await auth();

    if (!user) {
      return;
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = 
      forwarded?.split(",")?.[0]?.trim() || 
      headersList.get("x-real-ip") || 
      headersList.get("remote-addr") || 
      undefined;

    const deviceInfo = userAgent ? extractDeviceInfo(userAgent) : undefined;

    const metadata = {
      user: {
        userId: user.id,
        userIdExternal: user.externalId || user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        primaryEmail: user.primaryEmailAddress?.emailAddress || "",
        orgRole: orgRole || undefined,
        orgName: sessionClaims?.orgName as string || undefined,
        orgSlug: orgSlug || undefined,
        emailVerified: user.primaryEmailAddress?.verification?.status === "verified",
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
      },
      session: {
        sessionId: sessionClaims?.sid as string || undefined,
        deviceInfo,
        userAgent,
        ipAddress,
        referrer: headersList.get("referer") || undefined,
        acceptLanguage: headersList.get("accept-language") || undefined,
      },
      additionalContext,
    };

    await logActivity(
      "authentication.detailed_login",
      `Detailed user login: ${metadata.user.fullName || metadata.user.primaryEmail}`,
      {
        severity: "info",
        meta_data: metadata,
        ip_address: ipAddress,
        device_info: deviceInfo,
      }
    );

    console.log(`Detailed user login logged: ${user.id} (${metadata.user.primaryEmail})`);
  } catch (error) {
    console.error("Error logging detailed user login:", error);
  }
}
