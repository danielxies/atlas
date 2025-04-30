'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import DxButton from '@/components/danielxie/dxButton';
import { useTheme } from './lib/hooks/useTheme';
import { alice, vastago } from './fonts';
import { Sun, Moon, Star, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import LogoTicker from './components/shared/LogoTicker';
import { sampleLogos } from './components/shared/SampleLogos';
import BrowserVideoDemo from './components/shared/BrowserVideoDemo';

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const { isDark, setIsDark } = useTheme();
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);

  const goHome = () => {
    router.push('/');
  };

  // FAQ items
  const faqItems = [
    {
      question: "Is Atlas free?",
      answer: "Atlas is free for students searching for research opportunities. We make money by partnering with universities and research institutions who pay a subscription fee to feature their opportunities prominently and access our talent pool."
    },
    {
      question: "How does Atlas work?",
      answer: "Atlas uses your profile information to match you with research opportunities that fit your skills, interests, and availability. Create your profile once, and apply to multiple opportunities with just a few clicks. We handle the application routing and tracking for you."
    },
    {
      question: "How does Atlas handle my data?",
      answer: "We take your privacy seriously. Your personal information is securely stored and is only shared with research institutions that you specifically apply to. You maintain full control over your profile information and can update or delete it at any time."
    },
    {
      question: "How does Atlas get the research postings it recommends me?",
      answer: "Our platform aggregates research opportunities from multiple sources, including direct partnerships with universities, research labs, and institutions. We also employ advanced web scrapers to find and verify new opportunities as they become available, ensuring you have access to the most current openings."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'} ${alice.variable} ${vastago.variable}`}>
      {/* Header/Navigation with Simplify-style layout */}
      <nav className={`fixed top-0 w-full px-6 py-4 z-50 ${isDark ? 'bg-[#1a1a1a]/95' : 'bg-[#e8e6d9]/95'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image 
              src="/icon.png" 
              alt="Atlas Logo" 
              width={32} 
              height={32}
              onClick={goHome} 
              className="cursor-pointer"
            />
            <span className={`${vastago.className} ${isDark ? 'text-[#d1cfbf]' : 'text-black'} text-xl font-semibold`}>Atlas</span>
          </div>

          {/* Right Side - Theme Toggle and Dashboard/Sign-in */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${isDark ? 'text-[#d1cfbf] hover:bg-white/10' : 'text-black hover:bg-black/10'} transition-colors`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {!isLoaded ? null : isSignedIn ? (
              <div className="flex items-center gap-4">
                <DxButton 
                  destination="/opportunities"
                  bgColor={isDark ? 'bg-[#d1cfbf]' : 'bg-claude-orange'}
                  textColor={isDark ? 'text-[#1a1a1a]' : 'text-white'}
                  hoverColor={isDark ? 'hover:bg-[#c1bfaf]' : 'hover:bg-claude-orange/90'}
                  rounded="rounded-full"
                  padding="px-5 py-2"
                >
                  Opportunities
                </DxButton>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button
                  className={`px-5 py-2 rounded-full ${isDark ? 'bg-[#d1cfbf] text-[#1a1a1a] hover:bg-[#c1bfaf]' : 'bg-claude-orange text-white hover:bg-claude-orange/90'} transition-colors`}
                >
                  Login
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Simplified style */}
      <main className="pt-32 pb-16">

        {/* Main Headline Section */}
        <div className="text-center max-w-4xl mx-auto px-6">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} leading-tight mb-6 font-alice`}>
            Find <span className={`italic ${isDark ? 'text-claude-orange/90' : 'text-claude-orange'} relative inline-block`}>
              meaningful
              <div className={`absolute -bottom-1 left-0 w-full h-0.5 ${isDark ? 'bg-claude-orange/90' : 'bg-claude-orange'}`}></div>
            </span> Research.
            <br />
            Powered by <span className={`relative ${isDark ? 'text-claude-orange/90' : 'text-claude-orange'} inline-block`}>
              one profile
              <div className={`absolute -bottom-1 left-0 w-full h-0.5 ${isDark ? 'bg-claude-orange/90' : 'bg-claude-orange'}`}></div>
            </span>.
          </h1>
          
          <p className={`text-xl ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-10 max-w-3xl mx-auto font-vastago`}>
            Get personalized research recommendations, craft tailored applications, autofill and track your research interests. We&apos;re here for every step of the process.
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center mb-24">
            {isSignedIn ? (
              <DxButton 
                destination="/dashboard"
                bgColor={isDark ? 'bg-[#d1cfbf]' : 'bg-claude-orange'}
                textColor={isDark ? 'text-[#1a1a1a]' : 'text-white'}
                hoverColor={isDark ? 'hover:bg-[#c1bfaf]' : 'hover:bg-claude-orange/90'}
                shadow="shadow-md"
                padding="px-8 py-3"
                rounded="rounded-full"
              >
                Go to Dashboard
              </DxButton>
            ) : (
              <SignInButton mode="modal">
                <button
                  className={`px-8 py-3 rounded-full shadow-md ${isDark ? 'bg-[#d1cfbf] text-[#1a1a1a] hover:bg-[#c1bfaf]' : 'bg-claude-orange text-white hover:bg-claude-orange/90'} transition-colors`}
                >
                  Get Started Now
                </button>
              </SignInButton>
            )}
          </div>
          
          {/* Video Demo Section - Using the updated component */}
          <BrowserVideoDemo 
            videoSrc="/videos/landing.mp4" 
            isDark={isDark}
            className="mb-[5rem]"
            posterSrc="/scenic.jpg"
          />
        </div>
        {/* Logo Ticker Section - Replacing the static logos */}
        <div className="max-w-6xl mx-auto mb-24 flex flex-col items-center">
          <div className={`mb-6 px-4 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>
            <h2 className={`text-3xl font-bold font-alice text-center uppercase tracking-wider`}>
              Featured In
            </h2>
          </div>
          <div className="relative overflow-hidden">
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-[#1a1a1a]/20 via-transparent to-[#1a1a1a]/20' : 'bg-gradient-to-b from-[#e8e6d9]/20 via-transparent to-[#e8e6d9]/20'} backdrop-blur-[1px] z-0`}></div>
            <LogoTicker 
              logos={sampleLogos}
              speed={30}
              direction="rtl"
              isDark={isDark}
            />
          </div>
        </div>

        {/* "We're here for" section */}
        <div className="max-w-6xl mx-auto mt-20 px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} leading-tight mb-8 font-alice`}>
              We&apos;re here for<br/>
              <span className={`relative inline-block ${isDark ? 'text-claude-orange/90' : 'text-claude-orange'}`}>
                every step 
                <div className={`absolute -bottom-1 left-0 w-full h-0.5 ${isDark ? 'bg-claude-orange/90' : 'bg-claude-orange'}`}></div>
              </span> of your (re)search.
            </h2>
            
            <p className={`text-xl ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-12 max-w-3xl mx-auto font-vastago`}>
              Tell us about your career history and goals. We&apos;ll help you craft a standout profile
              and help you land your dream research opportunity.
            </p>
          </div>

          {/* Job Matches Section */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32 mt-[10rem]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-claude-orange/10'}`}>
                  <span className="text-claude-orange">🔍</span>
                </div>
                <h3 className={`text-xl font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} font-vastago`}>Personalized Matches</h3>
              </div>
              
              <h2 className={`text-3xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} mb-6 font-alice leading-tight`}>
                Get matched to Meaningful, Interesting Research Opportunities.
              </h2>
              
              <p className={`text-lg ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-6 font-vastago`}>
                Forget endlessly cold emailing professors. Tell us your preferences & 
                dealbreakers and we&apos;ll match you with roles that fit.
              </p>
              
              {isSignedIn ? (
                <DxButton 
                  destination="/opportunities"
                  bgColor={isDark ? 'bg-[#d1cfbf]' : 'bg-claude-orange'}
                  textColor={isDark ? 'text-[#1a1a1a]' : 'text-white'}
                  hoverColor={isDark ? 'hover:bg-[#c1bfaf]' : 'hover:bg-claude-orange/90'}
                  shadow="shadow-md"
                  padding="px-8 py-3"
                  rounded="rounded-full"
                >
                  Find Opportunities
                </DxButton>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className={`px-8 py-3 rounded-full shadow-md ${isDark ? 'bg-[#d1cfbf] text-[#1a1a1a] hover:bg-[#c1bfaf]' : 'bg-claude-orange text-white hover:bg-claude-orange/90'} transition-colors`}
                  >
                    Get Started Now
                  </button>
                </SignInButton>
              )}
            </div>
            
            <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-xl shadow-lg overflow-hidden p-4`}>
              <Image 
                src="/scenic.jpg" 
                alt="Job matches visualization" 
                width={600} 
                height={400}
                className="rounded-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* FAQ Section - Replacing "How We Help Students" */}
        <div className="max-w-6xl mx-auto my-32 px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} leading-tight mb-8 font-alice`}>
              Got questions?
            </h2>
            <p className={`text-xl ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-12 max-w-3xl mx-auto font-vastago`}>
              Explore our FAQ section to learn more.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className={`mb-6 ${isDark ? 'border-b border-gray-800' : 'border-b border-gray-200'} pb-6`}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className={`flex items-center justify-between w-full text-left ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} focus:outline-none`}
                >
                  <div className="flex items-center">
                    <div className="mr-4 text-gray-400">
                      <span className="inline-block w-6 h-6">💬</span>
                    </div>
                    <h3 className={`text-xl font-medium font-vastago`}>{item.question}</h3>
                  </div>
                  <div>
                    {openFaqIndex === index ? 
                      <Minus size={20} className={`${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'}`}/> : 
                      <Plus size={20} className={`${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'}`}/>
                    }
                  </div>
                </button>
                {openFaqIndex === index && (
                  <div className={`mt-4 pl-10 pr-4 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} font-vastago`}>
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Call to Action */}
      <section className={`py-16 px-6 md:px-12 lg:px-24 ${isDark ? 'bg-[#1a1a1a]' : 'bg-claude-orange'} ${isDark ? 'text-[#d1cfbf]' : 'text-white'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 font-alice">Ready to Begin Your Research Journey?</h2>
          <p className="text-xl mb-8 opacity-90 font-vastago">
            Join thousands of students who have found their perfect research match on our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Only show Create Free Account if not signed in */}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button
                  className={`px-8 py-3 rounded-full shadow-md ${isDark ? 'bg-[#d1cfbf] text-[#1a1a1a] hover:bg-[#c1bfaf]' : 'bg-white text-claude-orange hover:bg-gray-100'} transition-colors`}
                >
                  Create Free Account
                </button>
              </SignInButton>
            )}
            <DxButton 
              destination="/opportunities"
              bgColor="bg-transparent"
              textColor={isDark ? 'text-[#d1cfbf]' : 'text-white'}
              hoverColor={isDark ? 'hover:bg-white/10' : 'hover:bg-claude-orange/90'}
              border={isDark ? 'border border-[#d1cfbf]' : 'border border-white'}
              padding="px-8 py-3"
              rounded="rounded-full"
            >
              Browse Opportunities
            </DxButton>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className={`py-8 px-6 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'}`}>
        <div className="text-center">
          <p className={`${vastago.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'}`}>
            © Atlas 2025
          </p>
        </div>
      </footer>
    </div>
  );
}