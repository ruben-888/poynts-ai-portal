# API Security Best Practices

This document outlines essential security practices for Next.js API routes based on analysis of the Carepoynt Portal codebase. Use this as a checklist when reviewing or implementing new API endpoints.

## ✅ Authentication & Authorization

### Required for ALL endpoints
- **Authentication Check**: Every route must call `await auth()` from Clerk
- **Permission Validation**: Use granular permissions like `org:rewards:view`, `org:users:manage`
- **Organization Context**: Validate `orgId` when needed for multi-tenant operations

```typescript
// ✅ Good Example
const { has, orgId, userId } = await auth();
if (!has({ permission: "org:rewards:view" })) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

```typescript
// ❌ Bad Example - Missing permission check
const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## ✅ Input Validation

### Schema Validation with Zod
- **Always validate input**: Use Zod schemas for all request data
- **Sanitize strings**: Use `.trim()` and length limits
- **Type coercion**: Use `z.coerce` for numbers/dates when appropriate
- **Enum validation**: Use `z.enum()` or `z.nativeEnum()` for restricted values

```typescript
// ✅ Good Example
const createUserSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["org:basic", "org:rewards_admin", "org:super_admin"])
});

const validatedData = createUserSchema.parse(body);
```

### Parameter Validation
- **URL Parameters**: Always validate route parameters exist and are correct type
- **Query Parameters**: Validate and sanitize all query parameters
- **Numeric IDs**: Parse and validate numeric IDs from strings

```typescript
// ✅ Good Example
const { catalog_id } = await params;
if (!catalog_id) {
  return NextResponse.json({ error: "Catalog ID is required" }, { status: 400 });
}
const catalogIdNum = Number(catalog_id);
```

## ✅ Database Security

### Prisma ORM Usage
- **Use Prisma ORM**: Never write raw SQL queries unless absolutely necessary
- **Parameterized queries**: Prisma handles this automatically
- **Select specific fields**: Use `select` to limit exposed data
- **Where clause validation**: Ensure filters are properly scoped

```typescript
// ✅ Good Example - Using Prisma with select
const catalog = await db.redemption_registry_groups.findUnique({
  where: { id: Number(catalog_id) },
  select: {
    id: true,
    name: true,
    ent_id: true,
    deleted_date: true
  }
});
```

### Data Access Control
- **Tenant isolation**: Filter by `ent_id` or `orgId` when needed
- **Soft deletes**: Check `deleted_date` fields
- **Limit data exposure**: Don't return sensitive fields in API responses

## ✅ Error Handling

### Secure Error Messages
- **Generic error messages**: Don't expose internal details to clients
- **Detailed logging**: Log full errors server-side for debugging 
- **Consistent error format**: Use standardized error response structure

```typescript
// ✅ Good Example
try {
  // ... operation
} catch (error) {
  console.error("Error fetching transactions:", error); // Detailed server logging
  return NextResponse.json(
    { error: "Failed to fetch transactions" }, // Generic client message
    { status: 500 }
  );
}
```

### HTTP Status Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (schema validation failures)
- `500` - Internal Server Error

## ✅ Data Exposure Control

### Response Filtering
- **Admin vs User modes**: Conditionally include sensitive fields
- **Financial data**: Restrict financial fields to authorized users only
- **Personal information**: Limit PII exposure based on permissions

```typescript
// ✅ Good Example - Conditional field inclusion
const baseSelect = {
  id: true,
  name: true,
  // ... public fields
};

const selectFields = isAdminMode
  ? {
      ...baseSelect,
      provider_balance: true,    // Admin-only
      rebate_provider_amount: true, // Admin-only
    }
  : baseSelect;
```

### Result Limiting & Pagination
- **Limit result size**: Validate and cap `limit` parameters
- **Offset validation**: Ensure offset is non-negative
- **Maximum limits**: Set reasonable upper bounds

```typescript
// ✅ Good Example
const limit = parseInt(searchParams.get("limit") || "100");
const validatedLimit = Math.min(Math.max(1, limit), 10000); // Cap at 10k
```

## ⚠️ Common Vulnerabilities to Avoid

### 1. SQL Injection
- **Risk**: Direct string concatenation in queries
- **Prevention**: Always use Prisma ORM, never raw SQL with user input

### 2. Authorization Bypass
- **Risk**: Missing permission checks or org context validation
- **Prevention**: Always validate permissions and tenant isolation

### 3. Mass Assignment
- **Risk**: Accepting all user input without validation
- **Prevention**: Use explicit schema validation with Zod

### 4. Information Disclosure
- **Risk**: Exposing sensitive data in error messages or responses
- **Prevention**: Use generic error messages, filter response fields

### 5. Injection via Query Parameters
- **Risk**: Using search parameters directly in database queries
- **Prevention**: Validate and sanitize all query parameters

```typescript
// ❌ Dangerous - Direct parameter usage
const sortBy = searchParams.get("sortBy") || "id";
const orderBy = { [sortBy]: "desc" }; // Could be exploited

// ✅ Safe - Whitelist allowed values
const allowedSortFields = ["id", "name", "date"];
const sortBy = allowedSortFields.includes(searchParams.get("sortBy")) 
  ? searchParams.get("sortBy") 
  : "id";
```

### 6. HTML/XSS Injection in Text Fields
- **Risk**: Storing unsanitized HTML content that could execute malicious scripts
- **Prevention**: Sanitize HTML input or use content security policies

```typescript
// ✅ Good Example - HTML sanitization in Zod schema
import DOMPurify from 'isomorphic-dompurify';

const contentSchema = z.object({
  description: z.string().transform(val => DOMPurify.sanitize(val)),
  longDescription: z.string().max(2000).transform(val => DOMPurify.sanitize(val)),
  instructions: z.string().optional().transform(val => val ? DOMPurify.sanitize(val) : val),
});

// Alternative: Strip HTML entirely for plain text fields
const plainTextSchema = z.object({
  title: z.string().trim().regex(/^[^<>]*$/, "HTML tags not allowed"),
  notes: z.string().transform(val => val.replace(/<[^>]*>/g, '')), // Strip HTML tags
});
```

### 7. URL/File Upload Vulnerabilities
- **Risk**: Malicious file uploads, server-side request forgery (SSRF), or binary exploits
- **Prevention**: Validate URLs, restrict file types, scan uploads

```typescript
// ✅ Good Example - URL validation
const urlSchema = z.object({
  imageUrl: z.string().url()
    .refine(url => {
      // Whitelist allowed domains
      const allowedDomains = ['cdn.example.com', 'images.example.com'];
      const domain = new URL(url).hostname;
      return allowedDomains.includes(domain);
    }, "URL domain not allowed")
    .refine(url => {
      // Restrict to safe protocols
      const protocol = new URL(url).protocol;
      return ['https:', 'http:'].includes(protocol);
    }, "Invalid URL protocol"),
  
  redemptionUrl: z.string().url()
    .refine(url => !url.includes('localhost') && !url.includes('127.0.0.1'), 
            "Local URLs not allowed")
});

// ✅ File upload validation example
const fileValidation = {
  // Validate file extensions
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  
  validateFile: (file: File) => {
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!this.allowedExtensions.includes(extension)) {
      throw new Error('File type not allowed');
    }
    if (file.size > this.maxFileSize) {
      throw new Error('File too large');
    }
    // Additional: Check MIME type matches extension
    // Additional: Scan file content for malware
  }
};
```

## 🔍 Security Review Checklist

When reviewing new API endpoints, verify:

- [ ] Authentication is required and implemented
- [ ] Permissions are checked for the specific action
- [ ] All input is validated with Zod schemas
- [ ] Database queries use Prisma ORM (no raw SQL)
- [ ] Error messages don't expose sensitive information
- [ ] Response data is filtered based on user permissions
- [ ] Rate limiting is implemented where appropriate
- [ ] Tenant isolation is enforced for multi-tenant data
- [ ] HTML content is sanitized to prevent XSS attacks
- [ ] URLs are validated and domain-restricted where applicable
- [ ] File uploads (if any) are properly validated for type, size, and content
- [ ] Plain text fields reject HTML/script content
- [ ] Logging includes sufficient detail for security monitoring

## 📚 Additional Resources

- [Clerk Authentication Documentation](https://clerk.com/docs)
- [Zod Schema Validation](https://zod.dev/)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
