import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Simple endpoint to debug Clerk authentication
export async function GET() {
  console.log("[DEBUG-AUTH] Testing auth function");
  const { userId, sessionId } = auth();
  console.log("[DEBUG-AUTH] auth() returned userId:", userId, "sessionId:", sessionId);
  
  console.log("[DEBUG-AUTH] Testing currentUser function");
  const user = await currentUser();
  console.log("[DEBUG-AUTH] currentUser() returned:", user ? `User found: ${user.id}` : "No user found");
  
  // Check environment variables (don't log the actual values for security)
  console.log("[DEBUG-AUTH] Environment check:");
  console.log("[DEBUG-AUTH] - CLERK_SECRET_KEY defined:", !!process.env.CLERK_SECRET_KEY);
  console.log("[DEBUG-AUTH] - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY defined:", !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  
  return NextResponse.json({
    authResult: {
      userId,
      sessionId,
      isAuthenticated: !!userId
    },
    currentUserResult: {
      exists: !!user,
      id: user?.id,
      email: user?.emailAddresses?.[0]?.emailAddress
    },
    environmentCheck: {
      secretKeyDefined: !!process.env.CLERK_SECRET_KEY,
      publishableKeyDefined: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    }
  });
} 