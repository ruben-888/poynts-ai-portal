# Role-Based Access Control (RBAC) System

## Overview

This document outlines the Role-Based Access Control (RBAC) system implemented in the Carepoynt Portal using Clerk's organization roles. The system provides a secure and flexible way to control access to different parts of the application based on user roles and permissions.

## Table of Contents

- [Role Definitions](#role-definitions)
- [Permission Structure](#permission-structure)
- [Route Access Control](#route-access-control)
- [Implementation Components](#implementation-components)
- [Usage Examples](#usage-examples)
- [Super Admin Access](#super-admin-access)
- [Adding New Roles or Permissions](#adding-new-roles-or-permissions)
- [Troubleshooting](#troubleshooting)

## Role Definitions

The system defines the following organization roles:

| Role               | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `system_admin`     | Full system access with all administrative capabilities |
| `rewards_admin`    | Full access to rewards program management               |
| `rewards_manager`  | Manage day-to-day rewards operations                    |
| `financial_admin`  | Access to financial and billing features                |
| `customer_service` | Access to customer-related features                     |
| `marketing`        | Access to marketing and reporting features              |
| `catalog_manager`  | Manage product and service catalogs                     |
| `client_manager`   | Manage client relationships and accounts                |
| `member`           | Standard member with read access to most resources      |
| `basic`            | Limited access to basic features                        |

### Role Hierarchy

The roles follow a general hierarchy where higher-level roles inherit permissions from lower-level roles:

1. `system_admin` (highest level)
2. `rewards_admin` / `financial_admin` / `catalog_manager` / `client_manager`
3. `rewards_manager`
4. `customer_service` / `marketing`
5. `member`
6. `basic` (lowest level)

## Permission Structure

Each role is assigned a set of permissions that determine what actions they can perform. Permissions follow a `resource:action` naming convention:

```typescript
// Example permission structure
{
  "system_admin": [
    "users:read",
    "users:write",
    "organizations:read",
    "organizations:write",
    "catalog:read",
    "catalog:write",
    "catalog:manage",
    "client:read",
    "client:write",
    "client:manage",
    // ... all permissions
  ],
  "rewards_admin": [
    "rewards:read",
    "rewards:write",
    "rewards:approve",
    "giftcards:read",
    "giftcards:write",
    "giftcards:issue",
    "catalog:read",
    // ... more permissions
  ]
}
```

### Core Permission Groups

The system organizes permissions into the following groups:

#### System Management

- **users**: Managing user accounts

  - `users:read` - View user information
  - `users:write` - Create, update, or delete users
  - `users:impersonate` - Log in as another user (system_admin only)

- **organizations**: Managing organization settings

  - `organizations:read` - View organization information
  - `organizations:write` - Create, update, or delete organizations
  - `organizations:manage_roles` - Assign roles to organization members

- **settings**: Application settings
  - `settings:read` - View application settings
  - `settings:write` - Modify application settings

#### Financial Operations

- **billing**: Financial and billing operations

  - `billing:read` - View billing information
  - `billing:write` - Create or update billing information
  - `billing:approve` - Approve financial transactions

- **reports**: Analytics and reporting
  - `reports:read` - View reports
  - `reports:write` - Create or modify reports
  - `reports:export` - Export report data

#### Customer Management

- **customers**: Customer management
  - `customers:read` - View customer information
  - `customers:write` - Create, update, or delete customer information
  - `customers:support` - Provide customer support

#### Rewards Program

- **rewards**: Rewards program management

  - `rewards:read` - View rewards information
  - `rewards:write` - Create, update, or delete rewards
  - `rewards:approve` - Approve rewards
  - `rewards:issue` - Issue rewards to customers

- **giftcards**: Gift card operations
  - `giftcards:read` - View gift card information
  - `giftcards:write` - Create or update gift card templates
  - `giftcards:issue` - Issue gift cards to customers
  - `giftcards:void` - Void or cancel gift cards

#### Catalog Management

- **catalog**: Product and service catalog management
  - `catalog:read` - View catalog items and categories
  - `catalog:write` - Create or update catalog items
  - `catalog:manage` - Manage catalog structure, categories, and settings
  - `catalog:approve` - Approve catalog items for publication
  - `catalog:import` - Import catalog data from external sources
  - `catalog:export` - Export catalog data

#### Client Management

- **client**: Client relationship management
  - `client:read` - View client information
  - `client:write` - Create or update client information
  - `client:manage` - Manage client relationships and settings
  - `client:assign` - Assign clients to account managers
  - `client:report` - Generate client-specific reports

### Role-Based Permission Assignment

Here's how permissions are assigned to each role:

#### System Administrator (`system_admin`)

Has access to all permissions in the system, including:

- All user management permissions
- All organization management permissions
- All settings permissions
- All billing and financial permissions
- All reporting permissions
- All customer management permissions
- All rewards program permissions
- All gift card permissions
- All catalog management permissions
- All client management permissions

#### Rewards Administrator (`rewards_admin`)

Focused on rewards program administration:

- `rewards:read`, `rewards:write`, `rewards:approve`, `rewards:issue`
- `giftcards:read`, `giftcards:write`, `giftcards:issue`, `giftcards:void`
- `customers:read`
- `catalog:read`
- `reports:read` (related to rewards)
- Limited user management permissions

#### Rewards Manager (`rewards_manager`)

Day-to-day rewards operations:

- `rewards:read`, `rewards:write`
- `giftcards:read`, `giftcards:issue`
- `customers:read`
- `catalog:read`
- `reports:read` (related to rewards)

#### Financial Administrator (`financial_admin`)

Financial operations and reporting:

- `billing:read`, `billing:write`, `billing:approve`
- `reports:read`, `reports:write`, `reports:export`
- `giftcards:read` (for financial tracking)
- `client:read`
- Limited user management permissions

#### Catalog Manager (`catalog_manager`)

Product and service catalog management:

- `catalog:read`, `catalog:write`, `catalog:manage`, `catalog:approve`
- `catalog:import`, `catalog:export`
- `reports:read` (related to catalog)
- Limited user management permissions

#### Client Manager (`client_manager`)

Client relationship management:

- `client:read`, `client:write`, `client:manage`, `client:assign`
- `client:report`
- `customers:read`
- `reports:read` (related to clients)
- Limited user management permissions

#### Customer Service (`customer_service`)

Customer support operations:

- `customers:read`, `customers:write`, `customers:support`
- `rewards:read`
- `giftcards:read`, `giftcards:issue`
- `catalog:read`
- `client:read`

#### Marketing (`marketing`)

Marketing and analytics:

- `customers:read`
- `reports:read`, `reports:export`
- `rewards:read`
- `catalog:read`

#### Member (`member`)

Standard member access:

- `users:read` (own profile)
- `organizations:read` (own organization)
- `customers:read` (limited)
- `rewards:read` (limited)
- `giftcards:read` (limited)
- `catalog:read` (limited)

#### Basic (`basic`)

Minimal access:

- `users:read` (own profile only)
- `organizations:read` (own organization only)
- Very limited read access to other resources

## Route Access Control

Routes in the application are protected based on roles. The system defines which roles can access specific routes:

```typescript
// Example route access configuration
{
  "/admin/system": ["system_admin"],
  "/admin/rewards": ["system_admin", "rewards_admin", "rewards_manager"],
  "/admin/finance": ["system_admin", "financial_admin"],
  "/admin/catalog": ["system_admin", "catalog_manager"],
  "/admin/clients": ["system_admin", "client_manager"],
  "/customers": ["system_admin", "rewards_admin", "customer_service", "marketing"],
  // ... more route definitions
}
```

## Implementation Components

The RBAC system consists of several key components:

### 1. Auth Utilities (`src/lib/auth.ts`)

Core utilities for role and permission checking:

- `hasRole()`: Check if a user has a specific role
- `hasPermission()`: Check if a user has a specific permission
- `hasRouteAccess()`: Check if a user can access a specific route
- `checkRouteAccess()`: Server-side route access checking

### 2. Client-Side Components

#### RoleGate (`src/components/auth/role-gate.tsx`)

A client component that conditionally renders UI elements based on user roles or permissions:

```tsx
<RoleGate allowedRoles={["system_admin", "financial_admin"]}>
  <FinancialControls />
</RoleGate>

// Or with permissions
<RoleGate allowedPermissions={["billing:write"]}>
  <BillingForm />
</RoleGate>
```

### 3. Server-Side Components

#### ProtectedRoute (`src/components/auth/protected-route.tsx`)

A server component that protects entire routes based on roles or permissions:

```tsx
export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["system_admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### 4. Middleware Integration

The system integrates with Next.js middleware to enforce route-based access control at the application level.

## Usage Examples

### Protecting a Page (Server-Side)

```tsx
// In src/app/admin/users/page.tsx
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["system_admin"]}>
      <div>
        <h1>User Management</h1>
        {/* Page content */}
      </div>
    </ProtectedRoute>
  );
}
```

### Conditional UI Rendering (Client-Side)

```tsx
// In a client component
import { RoleGate } from "@/components/auth/role-gate";

export function Dashboard() {
  return (
    <div>
      {/* Content visible to all authenticated users */}
      <h1>Dashboard</h1>

      {/* Admin-only section */}
      <RoleGate allowedRoles={["system_admin"]}>
        <AdminControls />
      </RoleGate>

      {/* Section for users with specific permissions */}
      <RoleGate allowedPermissions={["reports:read"]}>
        <ReportsSection />
      </RoleGate>

      {/* Catalog management section */}
      <RoleGate allowedPermissions={["catalog:manage"]}>
        <CatalogManagement />
      </RoleGate>

      {/* Client management section */}
      <RoleGate allowedPermissions={["client:manage"]}>
        <ClientManagement />
      </RoleGate>
    </div>
  );
}
```

### Programmatic Access Checks

```tsx
// Server-side
import { hasPermission } from "@/lib/auth";

export async function ServerComponent() {
  const canManageBilling = await hasPermission("billing:write");
  const canManageCatalog = await hasPermission("catalog:manage");

  return (
    <div>
      {canManageBilling && <BillingControls />}
      {canManageCatalog && <CatalogControls />}
    </div>
  );
}

// Client-side
("use client");
import { useAuth } from "@clerk/nextjs";
import { ROLE_PERMISSIONS, OrganizationRole } from "@/lib/auth";

export function ClientComponent() {
  const { orgRole } = useAuth();
  const userPermissions = ROLE_PERMISSIONS[orgRole as OrganizationRole] || [];
  const canManageBilling = userPermissions.includes("billing:write");
  const canManageClients = userPermissions.includes("client:manage");

  return (
    <div>
      {canManageBilling && <BillingControls />}
      {canManageClients && <ClientControls />}
    </div>
  );
}
```

## Super Admin Access

The system includes a special "Super Admin" access level that is restricted to members of the CarePo organization only. This provides access to system-critical functionality that should not be available to client organizations.

### Implementation

Super Admin access is implemented through a combination of:

1. **Organization ID Check**: Verifying that the user belongs to the CarePo organization
2. **Role Check**: Ensuring the user has the appropriate role within that organization

```typescript
// Example implementation in middleware
const CAREPO_ORG_ID = process.env.CAREPO_ORGANIZATION_ID;

// Check if user is a CarePo Super Admin
if (userId && orgId === CAREPO_ORG_ID && orgRole === "system_admin") {
  // Allow access to super admin routes
}
```

### Protected Routes

Super Admin routes are protected with an additional check for the CarePo organization ID:

```typescript
// In src/app/super-admin/page.tsx
export default function SuperAdminPage() {
  return (
    <SuperAdminRoute>
      <div>
        <h1>Super Admin Dashboard</h1>
        {/* Super admin content */}
      </div>
    </SuperAdminRoute>
  );
}
```

### SuperAdminRoute Component

A specialized component for protecting Super Admin routes:

```tsx
// src/components/auth/super-admin-route.tsx
export async function SuperAdminRoute({ children }) {
  const authData = await auth();
  const { userId, orgId, orgRole } = authData;

  const CAREPO_ORG_ID = process.env.CAREPO_ORGANIZATION_ID;

  // Check if user is from CarePo organization and has system_admin role
  if (!userId || orgId !== CAREPO_ORG_ID || orgRole !== "system_admin") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
```

### Configuration

To set up Super Admin access:

1. Store the CarePo organization ID in your environment variables:

   ```
   CAREPO_ORGANIZATION_ID=org_xxxxxxxxxxxx
   ```

2. Ensure that only trusted users are assigned the `system_admin` role within the CarePo organization.

3. Use the `SuperAdminRoute` component to protect routes that should only be accessible to CarePo Super Admins.

## Adding New Roles or Permissions

To add new roles or permissions:

1. Update the `OrganizationRole` type in `src/lib/auth.ts`
2. Add the new role and its permissions to the `ROLE_PERMISSIONS` object
3. Update the `ROUTE_ACCESS` object if the new role should have access to specific routes
4. Configure the new role in the Clerk dashboard

Example:

```typescript
// Adding a new 'support_specialist' role
export type OrganizationRole =
  | "system_admin"
  | "rewards_admin"
  | "catalog_manager"
  | "client_manager"
  // ... existing roles
  | "support_specialist"; // New role

export const ROLE_PERMISSIONS: Record<OrganizationRole, string[]> = {
  // ... existing roles
  support_specialist: [
    "customers:read",
    "customers:support",
    "rewards:read",
    "giftcards:read",
    "catalog:read",
    "client:read",
  ],
};

export const ROUTE_ACCESS: Record<string, OrganizationRole[]> = {
  // ... existing routes
  "/support": ["system_admin", "customer_service", "support_specialist"],
};
```

## Troubleshooting

### Common Issues

1. **User can't access a route they should have access to**

   - Check if the user has the correct role assigned in Clerk
   - Verify the route is correctly defined in `ROUTE_ACCESS`
   - Check browser console for middleware logs

2. **UI elements not showing for a user with the correct role**

   - Ensure you're using the correct role name in `allowedRoles`
   - Check if the component is client-side and using `RoleGate` correctly
   - Verify the user's role in the Clerk dashboard

3. **Middleware not enforcing access control**
   - Check if `NEXT_PUBLIC_BYPASS_ORG_CHECK` is set to `true` in your environment
   - Verify the route is included in the middleware matcher configuration

### Debugging

The middleware logs detailed information about authentication and authorization checks. Look for these log patterns:

- `🔐 Auth details:` - Shows the current user's authentication status
- `🚫 Access denied to [path] for role [role]` - Indicates an access denial
- `✅ Access granted to [path] for role [role]` - Indicates successful authorization

## Clerk Dashboard Configuration

To configure roles in the Clerk dashboard:

1. Go to the [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your application
3. Navigate to "Organizations" in the sidebar
4. Go to the "Roles" tab
5. Add the roles defined in this document
6. Assign roles to organization members as needed

---

For any questions or issues with the RBAC system, please contact the development team.
