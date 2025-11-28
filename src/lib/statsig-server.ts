import { Statsig, StatsigUser } from "@statsig/statsig-node-core";
import { headers } from "next/headers";

// Initialize Statsig server instance
let statsigInstance: Statsig | null = null;

export async function initializeStatsigServer() {
  if (!statsigInstance) {
    const serverSecret = process.env.STATSIG_SECRET_KEY;
    if (!serverSecret) {
      console.warn(
        "STATSIG_SECRET_KEY not found, skipping Statsig server initialization"
      );
      return null;
    }

    const options = {
      environment: process.env.ENVIRONMENT || "development",
    };

    statsigInstance = new Statsig(serverSecret, options);
    await statsigInstance.initialize();
  }
  return statsigInstance;
}

export async function getStatsigBootstrapValues(
  user: StatsigUser
): Promise<any> {
  try {
    const statsig = await initializeStatsigServer();

    if (!statsig) {
      return null;
    }

    // Get all feature gates and dynamic configs for the user
    const gates = await statsig.getClientInitializeResponse(user);

    return gates;
  } catch (error) {
    console.error("Error getting Statsig bootstrap values:", error);
    return null;
  }
}

/**
 * Extract real client information from Next.js request context
 */
async function extractClientInfo() {
  try {
    const headersList = await headers();

    // Extract IP address from various headers (in order of preference)
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") || // Cloudflare
      headersList.get("x-client-ip") ||
      "127.0.0.1";

    // Extract user agent
    const userAgent =
      headersList.get("user-agent") ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

    // Extract country from Cloudflare or other CDN headers
    const country =
      headersList.get("cf-ipcountry") || // Cloudflare
      headersList.get("x-country-code") ||
      "US";

    // Extract locale from Accept-Language header
    const acceptLanguage = headersList.get("accept-language");
    let locale = "en-US";
    if (acceptLanguage) {
      // Parse the first preferred language
      const languages = acceptLanguage.split(",");
      if (languages.length > 0) {
        const primaryLang = languages[0].split(";")[0].trim();
        locale = primaryLang || "en-US";
      }
    }

    return {
      ip,
      userAgent,
      country,
      locale,
    };
  } catch (error) {
    // If we can't access headers (e.g., not in a request context), return defaults
    console.warn("Could not extract client info from headers:", error);
    return {
      ip: "127.0.0.1",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      country: "US",
      locale: "en-US",
    };
  }
}

export async function createStatsigUser(
  userId: string,
  userEmail?: string,
  userFullName?: string,
  sessionClaims?: any,
  options?: {
    ip?: string;
    userAgent?: string;
    country?: string;
    locale?: string;
    extractFromRequest?: boolean; // Whether to extract from Next.js request context
  }
): Promise<StatsigUser> {
  // Extract client info from request context if requested and no explicit values provided
  const shouldExtractFromRequest = options?.extractFromRequest !== false;
  const clientInfo = shouldExtractFromRequest
    ? await extractClientInfo()
    : null;

  return {
    userID: userId,
    email: userEmail || "unknown@example.com",
    appVersion: "1.0.0",
    custom: {
      fullName: userFullName || "Unknown Person",
      orgSlug: sessionClaims?.org_slug,
      orgRole: sessionClaims?.org_role,
    },
    customIDs: null,
    privateAttributes: null,
    ip: options?.ip || clientInfo?.ip || "127.0.0.1",
    userAgent:
      options?.userAgent ||
      clientInfo?.userAgent ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    country: options?.country || clientInfo?.country || "US",
    locale: options?.locale || clientInfo?.locale || "en-US",
  };
}
