import { OrganizationRole } from "@/lib/auth";

export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: OrganizationRole;
    };
  }
} 