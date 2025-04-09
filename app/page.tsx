'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const goHome = () => {
    router.push('/');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header/Navigation */}
      <header className="absolute top-0 w-full px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <Image 
            src="/icon.png" 
            alt="Research Hub Logo" 
            width={36} 
            height={36} 
            onClick={goHome} 
            className="cursor-pointer"
          />
          <h2 className="text-xl font-bold text-blue-800">ResearchConnect</h2>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
          {isSignedIn ? (
              <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                Dashboard
              </Link>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                onClick={() => router.push('/opportunities')}
              >
                Explore Opportunities
              </button>
              <UserButton afterSignOutUrl="/" />
            </>
            
          ) : (
            <>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                onClick={() => router.push('/opportunities')}
              >
                Explore Opportunities
              </button>
              <button 
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition"
                onClick={() => router.push('/login')}
              >
                Log In
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                onClick={() => router.push('/signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Discover Your Perfect Research Opportunity
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Connecting talented students with groundbreaking research projects across disciplines. Start your research journey today.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition shadow-md"
                  onClick={() => router.push('/opportunities')}
                >
                  Find Opportunities
                </button>
                {/* Render Create Free Account only when not signed in */}
                {!isSignedIn && (
                  <button 
                    className="border border-blue-600 text-blue-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-50 transition"
                    onClick={() => router.push('/signup')}
                  >
                    Create Free Account
                  </button>
                )}
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <div className="relative">
                <Image 
                  src="/research-image.jpg" 
                  alt="Students engaged in research" 
                  width={600} 
                  height={400}
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">How We Help Students</h2>
          <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Our platform makes finding and applying to research opportunities simpler than ever before.
          </p>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Instant Updates</h3>
              <p className="text-gray-700">
                Our scraper finds new opportunities as soon as they are available and sends updates directly to your email.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v4m0 4v4m0-8h4m-4 0H8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Simplified Applications</h3>
              <p className="text-gray-700">
                Create a single profile and apply to multiple research positions with just a few clicks, saving you time and effort.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Extensive Directory</h3>
              <p className="text-gray-700">
                Browse our comprehensive directory of research opportunities and easily find the perfect match for your interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 md:px-12 lg:px-24 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Research Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who have found their perfect research match on our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Only show Create Free Account if not signed in */}
            {!isSignedIn && (
              <button 
                className="bg-white text-blue-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-100 transition shadow-md"
                onClick={() => router.push('/signup')}
              >
                Create Free Account
              </button>
            )}
            <button 
              className="border border-white text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => router.push('/opportunities')}
            >
              Browse Opportunities
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12 lg:px-24 bg-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <Image src="/icon.png" alt="Research Hub Logo" width={24} height={24} />
              <span className="text-gray-800 font-semibold">ResearchConnect</span>
            </div>
            <p className="text-gray-600 mt-2">Connecting students with research since 2024</p>
          </div>
          <div className="text-center md:text-right">
            <div className="flex space-x-6 mb-4 justify-center md:justify-end">
              <a href="#" className="text-gray-600 hover:text-blue-600">About</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Contact</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Terms</a>
            </div>
            <p className="text-gray-600">© 2024 ResearchConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
