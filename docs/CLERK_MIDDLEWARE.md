import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Temporary environment variable to bypass organization check for debugging
// Set NEXT_PUBLIC_BYPASS_ORG_CHECK=true in your .env.local to enable
const BYPASS_ORG_CHECK = process.env.NEXT_PUBLIC_BYPASS_ORG_CHECK === 'true';

export default clerkMiddleware(async (auth, req) => {
  console.log('🔍 Middleware executing for path:', req.nextUrl.pathname);
  
  // Check if bypass is enabled via environment variable
  if (BYPASS_ORG_CHECK) {
    console.log('⚠️ Bypassing organization check due to NEXT_PUBLIC_BYPASS_ORG_CHECK=true');
    return;
  }
  
  // Check if bypass is requested via query param (for debugging only)
  const bypassOrgCheck = req.nextUrl.searchParams.get('bypassOrgCheck') === 'true';
  if (bypassOrgCheck) {
    console.log('⚠️ Bypassing organization check due to query parameter');
    return;
  }
  
  try {
    const authObject = await auth();
    const { userId, orgId, orgRole } = authObject;
    
    console.log('🔐 Auth details:', { 
      userId, 
      orgId, 
      orgRole,
      hasUserId: !!userId, 
      hasOrgId: !!orgId,
      pathname: req.nextUrl.pathname,
      fullUrl: req.url
    });
    
    // Log all available auth properties
    console.log('📋 Full auth object keys:', Object.keys(authObject));
    
    // Check if there are any organization-related properties
    const orgRelatedKeys = Object.keys(authObject).filter(key => 
      key.toLowerCase().includes('org') || key.toLowerCase().includes('organization')
    );
    if (orgRelatedKeys.length > 0) {
      console.log('🏢 Organization-related properties:', orgRelatedKeys);
      orgRelatedKeys.forEach(key => {
        // Safely log the value if it exists
        if (authObject[key as keyof typeof authObject] !== undefined) {
          console.log(`🏢 ${key}:`, authObject[key as keyof typeof authObject]);
        }
      });
    }
    
    // Redirect signed in users to organization selection page if they are not active in an organization
    if (userId && !orgId && req.nextUrl.pathname !== '/org-selection') {
      console.log('🔄 Redirecting to org-selection because user has no active organization');
      const searchParams = new URLSearchParams({ redirectUrl: req.url });
      const orgSelection = new URL(`/org-selection?${searchParams.toString()}`, req.url);
      console.log('🔀 Redirect URL:', orgSelection.toString());
      return NextResponse.redirect(orgSelection);
    }
    
    console.log('✅ Middleware completed without redirect for path:', req.nextUrl.pathname);
  } catch (error) {
    console.error('❌ Error in middleware:', error);
    // Don't redirect on error, let the request continue
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; d