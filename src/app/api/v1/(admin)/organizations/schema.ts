/**
 * Organization domain response types
 */

import { StatusEnum, UserRoleEnum, ApiKeyStatusEnum } from "../../_lib/schemas";

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  status: StatusEnum;
  parent_id?: string | null;
  auth_provider_org_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Organization with children (hierarchical)
 */
export interface OrganizationWithChildren extends Organization {
  children?: Organization[];
}

/**
 * User entity
 */
export interface User {
  id: string;
  auth_provider_user_id: string;
  organization_fk: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRoleEnum;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
}

/**
 * API Key entity (without sensitive data)
 */
export interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  organization_fk?: string | null;
  status: ApiKeyStatusEnum;
  permissions?: string[] | null;
  expires_at?: string | null;
  last_used_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Organization list response
 */
export interface OrganizationListResponse {
  data: Organization[];
  limit: number;
  offset: number;
}

/**
 * Organization detail response
 */
export interface OrganizationDetailResponse {
  data: OrganizationWithChildren;
  meta?: {
    timestamp: string;
  };
}
