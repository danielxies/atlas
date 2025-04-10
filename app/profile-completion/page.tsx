'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useTheme } from '../lib/hooks/useTheme';
import ProfileCompletionForm from '../components/dashboard/ProfileCompletionForm';
import { supabase } from '@/lib/supabase';

export default function ProfileCompletionPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const { isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Format the time left into minutes and seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Effect to handle the countdown timer and account deletion
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    // Set a timer to delete the account if onboarding is not completed
    let timer: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isTimerActive) {
      // If time runs out, delete the user account
      const deleteAccount = async () => {
        try {
          const response = await fetch('/api/delete-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id }),
          });
          
          if (response.ok) {
            // Redirect to login page after account deletion
            router.push('/login?error=onboarding-timeout');
          } else {
            console.error('Failed to delete account:', await response.json());
            // Still redirect to login to force user to re-authenticate
            router.push('/login');
          }
        } catch (error) {
          console.error('Error deleting account:', error);
          router.push('/login');
        }
      };
      
      deleteAccount();
      setIsTimerActive(false);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoaded, isSignedIn, user, timeLeft, isTimerActive, router]);

  // Delete the account if user navigates away from the page without completing onboarding
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (isTimerActive) {
        e.preventDefault();
        e.returnValue = '';
        // We can't reliably call the delete API here due to browser restrictions
        // The cleanup will be handled by the server-side session timeout
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoaded, isSignedIn, user, isTimerActive]);

  // Check if the user is already logged in and has completed their profile
  useEffect(() => {
    if (!isLoaded) return;

    // If not signed in, redirect to sign-in page
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    // Check if the user has already completed their profile
    const checkProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('university, major')
          .eq('clerk_id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          return;
        }

        // If the user already has a university and major, they've completed their profile
        // so redirect them to the dashboard and stop the timer
        if (data && data.university && data.major) {
          setIsTimerActive(false);
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error in profile check:', err);
      }
    };

    checkProfile();
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-white text-black'}`}>
        Loading...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-alice`}>
            Almost there!
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago`}>
            Tell us a bit about yourself so we can match you with personalized research opportunities.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className={`mb-6 p-4 rounded-lg ${
          timeLeft <= 60 
            ? 'bg-red-100 text-red-800' 
            : timeLeft <= 120 
              ? 'bg-yellow-100 text-yellow-800' 
              : isDark ? 'bg-[#2a2a2a] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'
        } text-center`}>
          <p className="font-vastago text-sm">
            {timeLeft <= 60 
              ? 'Warning: Your account will be deleted if you don\'t complete the profile in:' 
              : 'Please complete your profile within:'}
          </p>
          <p className={`text-xl font-semibold mt-1 ${
            timeLeft <= 60 ? 'text-red-600' : timeLeft <= 120 ? 'text-yellow-600' : ''
          }`}>
            {formatTimeLeft()}
          </p>
        </div>
        
        <ProfileCompletionForm onSuccess={() => setIsTimerActive(false)} />
      </div>
    </div>
  );
} 