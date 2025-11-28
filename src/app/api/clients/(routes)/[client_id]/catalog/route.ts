import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCatalogForClient } from "@/app/api/services/catalogs/get-catalog-for-client";
import { verifyOrgHasCatalogAccess } from "@/app/api/services/authorization/catalog-auth";
import { getTenantIdFromOrgId } from "@/app/api/_utils/tenant-resolver";
import { isCarePoyntAdmin } from "@/lib/authorization";

export async function GET(
  request: NextRequest,
  { params }: { params: { client_id: string } },
) {
  try {
    const { orgId, has } = await auth();

    // Check catalog view permission
    if (!has({ permission: "org:catalogs:view" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract URL parameters
    const { client_id: clientId } = await params;
    const orgIdParam = request.nextUrl.searchParams.get("org_id");

    // Validate required parameters
    if (!orgId) {
      return NextResponse.json(
        { error: "No organization context" },
        { status: 400 },
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 },
      );
    }

    // Determine which org to use: admins can view any org via query param, regular users only their own
    let authProviderOrgId: string;

    if (orgIdParam) {
      // User requested to view a specific organization
      const isAdmin = await isCarePoyntAdmin();
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      authProviderOrgId = orgIdParam;
    } else {
      // No org specified, use current user's org
      authProviderOrgId = orgId;
    }

    // Resolve tenant ID from auth provider org ID
    let tenantId: number;
    try {
      tenantId = await getTenantIdFromOrgId(authProviderOrgId);
    } catch (error) {
      console.error("Error resolving tenant for organization:", error);
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 400 },
      );
    }

    // Verify catalog access permission
    // Note: clientId is actually an enterprise ID in this context
    const enterpriseId = parseInt(clientId, 10);
    if (isNaN(enterpriseId)) {
      return NextResponse.json(
        { error: "Invalid enterprise ID format" },
        { status: 400 },
      );
    }

    const hasCatalogPermission = await verifyOrgHasCatalogAccess(
      authProviderOrgId,
      enterpriseId,
    );
    if (!hasCatalogPermission) {
      return NextResponse.json(
        { error: "Organization does not have access to this catalog" },
        { status: 403 },
      );
    }

    const catalog = await getCatalogForClient(tenantId, enterpriseId);

    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Error fetching catalog for client:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 },
    );
  }
}
