import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/login(.*)", "/verify"]);

const isCustomerRoute = createRouteMatcher(["/(customer)/(.*)"]);

const isCPAdminRoute = createRouteMatcher(["/admin(.*)"]);

const isApiRoute = createRouteMatcher(["/api/(.*)", "/trpc/(.*)"]);

// Current app assumes all users are members of wellco or carepoynt and should have access to organizational data and
// resources. Once all data requires organization level authorization remove the org slug checks.
const allowedCPAdminOrgSlugs = [
  "carepoynt",
  "carepoynt-qa",
];
const allowedOrgSlugs = [
  "carepoynt",
  "carepoynt-qa",
  "wellco",
];

export default clerkMiddleware(async (auth, req) => {
  // Handle API routes differently
  if (isApiRoute(req)) {
    try {
      const { userId, orgSlug } = await auth();
      if (userId) {
        if (allowedOrgSlugs.includes(orgSlug ?? "")) {
          return;
        }
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch { }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isPublicRoute(req)) {
    return;
  }

  // Restrict CP Admin routes to users with specific permissions
  if (isCPAdminRoute(req)) {
    // Check if user is logged in and has permission.
    const { orgSlug } = await auth.protect((has) => {
      // Clerk uses a notfound error on failure because the next app router appears to be at an early alpha stage.
      return has({ permission: "org:cpadmin:access" });
    });
    // Check user organization.
    if (!allowedCPAdminOrgSlugs.includes(orgSlug ?? "")) {
      // Use a notfound error on failure to create a consistent, but horrifically wrong, response pattern.
      notFound();
    }
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
