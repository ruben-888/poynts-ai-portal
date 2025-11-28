export interface UserContext {
  userId: string;
  userIdExternal: string;
  actor: any;
  firstName: string;
  lastName: string;
  fullName: string;
  primaryEmail: string;
  orgRole: string;
  orgName: string;
  orgSlug: string;
}

// Helper function to extract user context from session claims
export function extractUserContext(
  userId: string | null,
  sessionClaims: any
): UserContext | undefined {
  if (!userId) return undefined;

  return {
    userId: sessionClaims?.userId || userId,
    userIdExternal: sessionClaims?.userIdExternal as string,
    actor: sessionClaims?.actor || {},
    firstName: sessionClaims?.firstName as string,
    lastName: sessionClaims?.lastName as string,
    fullName: sessionClaims?.fullName as string,
    primaryEmail: sessionClaims?.primaryEmail as string,
    orgRole: sessionClaims?.orgRole as string,
    orgName: sessionClaims?.orgName as string,
    orgSlug: sessionClaims?.orgSlug as string,
  };
}
