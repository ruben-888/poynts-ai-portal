# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
pnpm dev

# Build and type checking
pnpm build
pnpm lint

# Testing
pnpm test           # Run tests once
pnpm test:watch     # Run tests in watch mode
pnpm test:ui        # Run tests with UI
pnpm coverage       # Run tests with coverage

# Database
prisma generate     # Generate Prisma client (runs on postinstall)
```

## Architecture Overview

**Carepoynt Portal** - A Next.js 15 rewards/loyalty platform with dual interfaces:

### Application Structure
- **Customer Interface** (`/(customer)`): Multi-tenant client management at root paths
- **Admin Interface** (`/(admin)`): Platform administration at `/admin/*` paths
- **Authentication**: Clerk.dev with organization-based access control
- **Database**: MySQL with Prisma ORM using modular schemas

### Core Business Domains
- **Rewards**: Gift card management with provider integrations (TangoCard, Blackhawk)
- **Financial**: Transaction processing, ledgers, journal entries
- **Members**: Customer/user management across tenants
- **Catalogs**: Product/service catalog management
- **Orders**: Payment processing and fulfillment

### Gift Card System (Key Domain)
Three-tier hierarchy managed through providers:
1. **Brands** (`redemption_giftcard_brands`): Merchant/retailer identity (e.g., Amazon)
2. **Items** (`redemption_giftcard_items`): Gift card types with provider linkage and rebate structure
3. **Gift Cards** (`redemption_giftcards`): Individual issuable instances with inventory tracking

### Tech Stack
- **Frontend**: Next.js 15 App Router, React 19, TailwindCSS, shadcn/ui
- **State**: TanStack Query for server state, React Context for UI state
- **Forms**: React Hook Form + Zod validation
- **Auth**: Clerk.dev with permission-based access control
- **Database**: MySQL + Prisma with schema separation
- **Monitoring**: Datadog RUM and logs
- **Feature Flags**: Statsig integration

### Key Files
- **Middleware**: `src/middleware.ts` - Route protection and org-level access control
- **Database**: `prisma/schema/` - Modular schema files by domain
- **Providers**: `src/interfaces/providers/` - Third-party service integrations
- **Services**: `src/services/` - Business logic layer (reports, transactions)

### Environment Setup
Requires `.env.local` with database credentials, Clerk keys, BigQuery config, and provider API keys (see README.md).

### Testing
Tests use Vitest with components located next to source files (`*.test.tsx`). Use utilities in `tests/test-utils.tsx` for component rendering and `tests/mocks/next-navigation.ts` for navigation mocking.