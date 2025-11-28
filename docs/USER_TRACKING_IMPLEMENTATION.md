# User Tracking Implementation Guide

This guide explains how to implement user tracking in API endpoints to capture audit trails for all system activities using Clerk authentication.

## Overview

We track user information from Clerk's session claims and store it in the `system_activity` table's `meta_data` field as structured JSON. This provides complete audit trails showing who performed what actions.

## Session Claims Structure

Our Clerk session claims provide the following user context:
```json
{
  "actor": {},
  "userId": "{{user.id}}",
  "userIdExternal": "{{user.external_id}}",
  "firstName": "{{user.first_name}}",
  "lastName": "{{user.last_name}}",
  "fullName": "{{user.full_name}}",
  "primaryEmail": "{{user.primary_email_address}}",
  "orgRole": "{{org.role}}",
  "orgName": "{{org.name}}",
  "orgSlug": "{{org.slug}}"
}
```

## Implementation Steps

### 1. Create Shared Types

Create a `types.ts` file in your API module directory:

```typescript
// src/app/api/[module]/types.ts
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
```

### 2. Update Route Handlers

Add user context extraction to your route handlers:

```typescript
// src/app/api/[module]/(routes)/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UserContext } from "../types";

// Helper function to extract user context from session claims
function extractUserContext(userId: string | null, sessionClaims: any): UserContext | undefined {
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

export async function POST(request: Request) {
  try {
    const { has, userId, sessionClaims } = await auth();
    
    // Check permissions
    const canCreate = has({ permission: "org:[module]:manage" });
    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    
    // Extract user context
    const userContext = extractUserContext(userId, sessionClaims);

    try {
      const result = await createService(data, userContext);
      return NextResponse.json({
        message: "Resource created successfully",
        data: result,
      }, { status: 201 });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { has, userId, sessionClaims } = await auth();
    
    const canUpdate = has({ permission: "org:[module]:manage" });
    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    const userContext = extractUserContext(userId, sessionClaims);

    try {
      const result = await updateService(data, userContext);
      return NextResponse.json({
        message: "Resource updated successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}
```

### 3. Update Service Functions

Modify your service functions to accept and use user context:

```typescript
// src/app/api/[module]/services/[service].ts
import { db } from "@/utils/db";
import { logActivity } from "../../sytem-activity/services/create-single-activity";
import { UserContext } from "../types";

export async function createResource(data: CreateData, userContext?: UserContext) {
  // Your business logic here
  const newResource = await db.[table].create({
    data: {
      // your data mapping
    },
  });

  // Prepare metadata
  const metadata: Record<string, any> = {
    [module]: {
      // Module-specific data
      resource_id: newResource.id,
      resource_name: newResource.name,
      // ... other relevant fields
    }
  };

  // Add user info to metadata if available
  if (userContext) {
    metadata.user = {
      userId: userContext.userId,
      userIdExternal: userContext.userIdExternal,
      actor: userContext.actor,
      firstName: userContext.firstName,
      lastName: userContext.lastName,
      fullName: userContext.fullName,
      primaryEmail: userContext.primaryEmail,
      orgRole: userContext.orgRole,
      orgName: userContext.orgName,
      orgSlug: userContext.orgSlug,
    };
  }

  // Log the activity
  await logActivity(
    "[module].create",
    `Resource created: ${newResource.name}`,
    {
      severity: "info",
      enterprise_id: newResource.enterprise_id, // if applicable
      meta_data: metadata,
    }
  );

  return newResource;
}

export async function updateResource(data: UpdateData, userContext?: UserContext) {
  // Your update logic here
  const updatedResource = await db.[table].update({
    // update logic
  });

  // Prepare metadata
  const metadata: Record<string, any> = {
    [module]: {
      resource_id: updatedResource.id,
      updated_fields: Object.keys(data).filter(key => key !== 'id'),
      // ... other relevant fields
    }
  };

  // Add user info to metadata if available
  if (userContext) {
    metadata.user = {
      userId: userContext.userId,
      userIdExternal: userContext.userIdExternal,
      actor: userContext.actor,
      firstName: userContext.firstName,
      lastName: userContext.lastName,
      fullName: userContext.fullName,
      primaryEmail: userContext.primaryEmail,
      orgRole: userContext.orgRole,
      orgName: userContext.orgName,
      orgSlug: userContext.orgSlug,
    };
  }

  // Log the activity
  await logActivity(
    "[module].update",
    `Resource updated: ${updatedResource.name}`,
    {
      severity: "info",
      enterprise_id: updatedResource.enterprise_id, // if applicable
      meta_data: metadata,
    }
  );

  return updatedResource;
}
```

## Metadata Structure

The metadata follows this standardized structure:

```json
{
  "user": {
    "userId": "user_abc123",
    "userIdExternal": "ext_456",
    "actor": {},
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "primaryEmail": "john.doe@company.com",
    "orgRole": "admin",
    "orgName": "Acme Corporation",
    "orgSlug": "acme-corp"
  },
  "[module]": {
    "resource_id": 123,
    "resource_name": "Example Resource",
    "updated_fields": ["name", "description"],
    // ... other module-specific data
  }
}
```

## Activity Types Convention

Use consistent naming for activity types:
- `[module].created` - For creation operations
- `[module].updated` - For update operations  
- `[module].deleted` - For deletion operations
- `[module].status_changed` - For status changes
- `[module].[specific_action]` - For other specific actions

## Best Practices

1. **Always Extract User Context**: Even if the endpoint doesn't currently log activities, extract user context for future use
2. **Consistent Metadata Structure**: Use the standardized structure with separate keys for user and module data
3. **Meaningful Descriptions**: Write clear, human-readable activity descriptions
4. **Error Handling**: Don't let activity logging failures break the main operation
5. **Performance**: User context extraction is lightweight, but consider impact in high-frequency endpoints

## Example Implementation: Catalogs Module

See the `clients` module implementation as a reference:
- `src/app/api/clients/types.ts` - Shared types
- `src/app/api/clients/(routes)/route.ts` - Route handlers with user context
- `src/app/api/clients/services/` - Service functions with activity logging

## Checklist for New Implementations

- [ ] Create `types.ts` with `UserContext` interface
- [ ] Add `extractUserContext` helper to route handlers  
- [ ] Extract `userId` and `sessionClaims` from `auth()`
- [ ] Pass `userContext` to service functions
- [ ] Update service function signatures to accept `UserContext`
- [ ] Structure metadata with `user` and `[module]` keys
- [ ] Call `logActivity` with appropriate activity type and metadata
- [ ] Test that activities appear in system activity logs

## Troubleshooting

- **Missing user data**: Check that session claims are properly configured in Clerk
- **TypeScript errors**: Ensure `UserContext` import is correct
- **Activities not appearing**: Verify `logActivity` import path and database connectivity
- **Empty user context**: Check that `userId` is available from `auth()` 
