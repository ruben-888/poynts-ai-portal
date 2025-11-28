import { auth } from "@clerk/nextjs/server";

const CAREPOYNT_ORG_SLUG = "carepoynt";

/**
 * Check if the current user is a member of the CarePoynt admin organization
 *
 * Members of the CarePoynt organization (slug: "carepoynt") are considered
 * super admins and can view data for any organization in the system.
 *
 * @returns Promise<boolean> - true if user is in CarePoynt org, false otherwise
 */
export async function isCarePoyntAdmin(): Promise<boolean> {
  const { orgSlug } = await auth();
  return orgSlug === CAREPOYNT_ORG_SLUG;
}
