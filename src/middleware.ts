import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/login(.*)", "/verify", "/extension", "/extension/privacy"]);

const isPublicApiRoute = createRouteMatcher(["/api/organizations/sync", "/api/extension/(.*)"]);

const isCustomerRoute = createRouteMatcher(["/(customer)/(.*)"]);

const isCPAdminRoute = createRouteMatcher(["/admin(.*)"]);

const isApiRoute = createRouteMatcher(["/api/(.*)", "/trpc/(.*)"]);

// Current app assumes all users are members of wellco or carepoynt and should have access to organizational data and
// resources. Once all data requires organization level authorization remove the org slug checks.
const allowedOrgSlugs = [
  "carepoynt",
  "carepoynt-qa",
  "wellco",
  "poynts-ai-1764352265",
  "angelai-1164371476",
];

export default clerkMiddleware(async (auth, req) => {
  // Allow public API routes without auth
  if (isPublicApiRoute(req)) {
    return;
  }

  // Handle API routes - authentication required only
  if (isApiRoute(req)) {
    try {
      const { userId } = await auth();
      if (userId) {
        return;
      }
    } catch { }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isPublicRoute(req)) {
    return;
  }

  // CP Admin routes - authentication required, no permission check
  if (isCPAdminRoute(req)) {
    await auth.protect();
    return;
  }

  // Secure everything else
  if (isCustomerRoute(req)) {
    // Check if user is logged in.
    const { orgSlug } = await auth.protect();
    // Check user organization.
    if (!allowedOrgSlugs.includes(orgSlug ?? "")) {
      // Use a notfound error on failure to create a consistent, but horrifically wrong, response pattern.
      notFound();
    }
    return;
  }

  // Yes, I know this is redundant
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
