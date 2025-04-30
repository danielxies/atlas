import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define routes that should be publicly accessible - adjust as needed
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  // Add our debug endpoint to public routes for testing
  '/api/debug-auth',
  // Add other public routes like landing page, e.g., '/'
];

// Check if a route is public
const isPublic = createRouteMatcher(publicRoutes);

export default clerkMiddleware({
  // An array of routes that should be accessible without Clerk authentication.
  publicRoutes,

  // Add afterAuth logic for better debugging and redirects
  afterAuth(auth, req, evt) {
    console.log("[MIDDLEWARE] afterAuth for path:", req.nextUrl.pathname);
    console.log("[MIDDLEWARE] auth object:", { 
      userId: auth.userId, 
      sessionId: auth.sessionId,
      isPublicRoute: isPublic(req)
    });

    // Handle users who aren't authenticated
    if (!auth.userId && !isPublic(req)) {
      console.log("[MIDDLEWARE] Unauthenticated request to protected route");
      
      // For API routes, return a 401 response
      if (req.nextUrl.pathname.startsWith('/api/')) {
        console.log("[MIDDLEWARE] Returning 401 for API route");
        return new Response('Middleware: Unauthorized', { status: 401 });
      }
      
      // For other routes, redirect to sign-in
      console.log("[MIDDLEWARE] Redirecting to sign-in");
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Skip profile completion redirect - we're removing the onboarding flow
    console.log("[MIDDLEWARE] Request allowed to proceed");
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and specific routes like health checks
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)', 
    // Ensure API routes ARE included for protection
    '/(api|trpc)(.*)',
  ],
};
