import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCatalogOverview } from "@/app/api/services/catalogs/get-catalog-overview";
import { getTenantIdFromOrgId } from "@/app/api/_utils/tenant-resolver";
import { isCarePoyntAdmin } from "@/lib/authorization";

export async function GET(req: Request) {
  try {
    const { has, orgId } = await auth();

    console.log('[Catalog Overview] Auth session orgId:', orgId);

    if (!has({ permission: "org:rewards:view" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization context" },
        { status: 400 }
      );
    }

    // Get the org_id from query params (for admin viewing other orgs)
    // If not provided, use the current user's org
    const { searchParams } = new URL(req.url);
    const orgIdParam = searchParams.get("org_id");

    console.log('[Catalog Overview] Query param org_id:', orgIdParam || 'none');

    let clerkOrgId: string;

    if (orgIdParam) {
      // Admin viewing a specific organization
      // Verify user is a member of CarePoynt admin org
      const isAdmin = await isCarePoyntAdmin();
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      console.log('[Catalog Overview] Admin viewing org:', orgIdParam);
      clerkOrgId = orgIdParam;
    } else {
      // Regular user viewing their own org
      console.log('[Catalog Overview] User viewing own org:', orgId);
      clerkOrgId = orgId;
    }

    // Resolve the tenant ID from the Clerk org ID
    console.log('[Catalog Overview] Resolving tenantId for clerkOrgId:', clerkOrgId);
    let tenantId: number;

    try {
      tenantId = await getTenantIdFromOrgId(clerkOrgId);
    } catch (error) {
      // Invalid org_id is a client error (400), not a server error (500)
      console.error('[Catalog Overview] Invalid org_id:', clerkOrgId);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Invalid organization ID",
        },
        { status: 400 }
      );
    }

    console.log('[Catalog Overview] Resolved tenantId:', tenantId);

    // Fetch the enhanced reward data with catalog memberships
    const data = await getCatalogOverview(tenantId);

    return NextResponse.json({
      data,
      success: true
    });
  } catch (error) {
    console.error("Error fetching catalog overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog overview" },
      { status: 500 }
    );
  }
}
