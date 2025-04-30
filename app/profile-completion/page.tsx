'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useTheme } from '../lib/hooks/useTheme';

export default function ProfileCompletionPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { isDark } = useTheme();

  // Immediately redirect users since we're removing the onboarding flow
  useEffect(() => {
    if (!isLoaded) return;

    // If not signed in, redirect to sign-in page
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // If signed in, redirect to dashboard/home
    router.push('/');
  }, [isLoaded, isSignedIn, router]);

  // Just show a loading indicator while we're redirecting
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-white text-black'}`}>
      Redirecting...
    </div>
  );
} 