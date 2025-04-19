'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/app/lib/hooks/useTheme'
import { alice, vastago } from '@/app/fonts'
import Link from 'next/link'

interface RequireProfileCompletionProps {
  children: ReactNode
}

export default function RequireProfileCompletion({ children }: RequireProfileCompletionProps) {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return
    
    // Always allow access to profile page
    if (pathname === '/profile') {
      setLoading(false)
      setProfileComplete(true)
      return
    }

    const checkProfileCompletion = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('university, major')
          .eq('clerk_id', user.id)
          .single()

        if (error) {
          console.error('Error checking profile:', error)
          setLoading(false)
          return
        }

        // Check if university and major are set
        const isComplete = !!(data && data.university && data.major)
        setProfileComplete(isComplete)
        setLoading(false)
      } catch (err) {
        console.error('Unexpected error checking profile:', err)
        setLoading(false)
      }
    }

    checkProfileCompletion()
  }, [isLoaded, isSignedIn, user, pathname])

  if (!isLoaded || loading) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'}`}>
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <div className={`flex space-x-2 ${vastago.className}`}>
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`h-5 w-5 rounded-full ${isDark ? 'bg-claude-orange/90' : 'bg-claude-orange'} animate-pulse`}
                  style={{
                    animationDelay: `${index * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <p className={`text-lg ${vastago.className} ${isDark ? 'text-white/80' : 'text-black/80'}`}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    router.push('/login')
    return null
  }

  if (!profileComplete) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'} p-8 flex flex-col items-center justify-center`}>
        <div className="max-w-md w-full bg-white dark:bg-[#262626] rounded-lg shadow-lg p-8">
          <h1 className={`text-2xl font-bold mb-4 ${alice.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>
            Complete Your Profile
          </h1>
          <p className={`mb-6 ${vastago.className} ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-700'}`}>
            Please enter your university and major before we can recommend research opportunities tailored to your profile.
          </p>
          <Link 
            href="/profile" 
            className={`w-full block text-center py-2 px-4 rounded ${isDark ? 'bg-claude-orange text-[#1a1a1a]' : 'bg-claude-orange-dark text-white'} ${vastago.className} font-medium hover:opacity-90 transition-opacity`}
          >
            Complete Your Profile
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 