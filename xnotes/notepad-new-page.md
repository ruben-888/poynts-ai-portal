# Next.js Page Structure Pattern

## Page Architecture Overview

This document outlines our standard approach for creating new pages in our Next.js application.

### Application Structure

Our application has two distinct areas:

1. **Customer Portal**: 
   - Located in `src/app/(customer)`
   - Contains all customer-facing pages and components
   - Only accessible to customers/clients

2. **Admin Portal**:
   - Located in `src/app/(admin)`
   - Contains system management functionality
   - Only accessible to super admins/system managers

### Security Model

- **Authentication/Authorization**: Implemented using Clerk
- Customers can only access the customer portal area
- Admin functionality is restricted to authorized personnel only

### Core Structure

1. **Server Component (Page)**: 
   - Located in the app directory following Next.js routing conventions
   - Acts as the main page component and handles server-side operations
   - Renders the associated client component

2. **Client Component**:
   - Located in the `components` directory at the same level as the page
   - Named using the pattern: `{route-name}-client.tsx`
   - Handles client-side interactivity and state management

### Naming Convention

- All component names use **lowercase with dashes** between words
- Client components always use the `-client` suffix

### Example:

For a page at route `/users` in the customer portal:

```
src/app/
├── (customer)/
│   ├── users/
│   │   ├── page.tsx (Server Component)
│   │   └── components/
│   │       └── users-client.tsx (Client Component)
├── (admin)/
│   ├── manage-users/
│   │   ├── page.tsx (Server Component)
│   │   └── components/
│   │       └── manage-users-client.tsx (Client Component)
```

### Data Fetching Pattern

- We use **TanStack Query** (formerly React Query) for data access within client components
- **Axios** is used for making API requests
- Server components can fetch data directly and pass it down to client components as props when needed

### Implementation Pattern

```tsx
// src/app/(customer)/users/page.tsx (Server Component)
import UsersClient from './components/users-client';

export default async function UsersPage() {
  // Any server-side operations here
  
  return (
    <UsersClient />
  );
}

// src/app/(customer)/users/components/users-client.tsx (Client Component)
'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// API function using Axios
const fetchUsers = async () => {
  const { data } = await axios.get('/api/users');
  return data;
};

export default function UsersClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers()
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    // Client-side rendering with data
  );
}
```

This pattern keeps our code organized, maintains a clear separation of concerns, and follows Next.js best practices for the App Router.
