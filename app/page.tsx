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

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const { isDark, setIsDark } = useTheme();
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);

  const goHome = () => {
    router.push('/');
  };

  // Partner logos array - college logos
  const collegeLogos = [
    { name: 'Microsoft', src: '/logos/microsoft.svg' },
    { name: 'Amazon', src: '/logos/amazon.svg' },
    { name: 'Apple', src: '/logos/apple.svg' },
    { name: 'Netflix', src: '/logos/netflix.svg' },
    { name: 'Facebook', src: '/logos/facebook.svg' },
    { name: 'Twitter', src: '/logos/twitter.svg' },
    { name: 'Spotify', src: '/logos/spotify.svg' },
  ];

  // FAQ items
  const faqItems = [
    {
      question: "Is Atlas free? How do you make money?",
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
                  destination="/dashboard"
                  bgColor={isDark ? 'bg-[#d1cfbf]' : 'bg-claude-orange'}
                  textColor={isDark ? 'text-[#1a1a1a]' : 'text-white'}
                  hoverColor={isDark ? 'hover:bg-[#c1bfaf]' : 'hover:bg-claude-orange/90'}
                  rounded="rounded-full"
                  padding="px-5 py-2"
                >
                  Dashboard
                </DxButton>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <DxButton 
                destination="/login"
                bgColor={isDark ? 'bg-[#d1cfbf]' : 'bg-claude-orange'}
                textColor={isDark ? 'text-[#1a1a1a]' : 'text-white'}
                hoverColor={isDark ? 'hover:bg-[#c1bfaf]' : 'hover:bg-claude-orange/90'}
                rounded="rounded-full"
                padding="px-5 py-2"
              >
                Dashboard
              </DxButton>
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
            Get personalized research recommendations, craft tailored applications, autofill and track your research applications. We&apos;re here for every step of the process.
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center mb-12">
            <DxButton 
              destination="/signup"
              bgColor={isDark ? 'bg-[#d1cfbf]' : 'bg-claude-orange'}
              textColor={isDark ? 'text-[#1a1a1a]' : 'text-white'}
              hoverColor={isDark ? 'hover:bg-[#c1bfaf]' : 'hover:bg-claude-orange/90'}
              shadow="shadow-md"
              padding="px-8 py-3"
              rounded="rounded-full"
            >
              Sign Up — It&apos;s Free!
            </DxButton>
          </div>
          
          {/* Reviews/Stars Line */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
            <span className={`${vastago.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'}`}>
              Join the many students who use Atlas.
            </span>
          </div>
          
          {/* Feature Pills */}
          <div className="flex justify-center gap-2 mb-12">
            <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100'} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} py-2 px-4 rounded-full font-vastago flex items-center gap-1 text-sm`}>
              <span>🔍</span> Research Matches
            </div>
            <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100'} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} py-2 px-4 rounded-full font-vastago flex items-center gap-1 text-sm`}>
              <span>⚡</span> Application Copilot
            </div>
            <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100'} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} py-2 px-4 rounded-full font-vastago flex items-center gap-1 text-sm`}>
              <span>📝</span> AI Resume Builder
            </div>
            <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100'} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} py-2 px-4 rounded-full font-vastago flex items-center gap-1 text-sm`}>
              <span>📊</span> Research Tracker
            </div>
          </div>
        </div>
        
        {/* Browser/Demo Section - Moved here */}
        <div className="max-w-5xl mx-auto px-6 mb-[5rem]">
          <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} p-4 rounded-lg shadow-xl overflow-hidden`}>
            <div className="w-full bg-gray-200 h-8 rounded-t-lg flex items-center px-2 gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1 flex justify-center">
                <div className="w-1/2 h-5 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <div className={`w-full ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'} h-96 rounded-b-lg flex items-center justify-center`}>
              <Image 
                src="/scenic.jpg" 
                alt="Research platform demonstration" 
                width={800} 
                height={500}
                className="rounded-lg object-cover max-h-80 w-auto"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-16 px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {collegeLogos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center">
                <Image 
                  src={logo.src} 
                  alt={`${logo.name} logo`} 
                  width={120} 
                  height={40} 
                  className={`h-8 w-auto object-contain ${isDark ? 'opacity-70 hover:opacity-100' : 'opacity-80 hover:opacity-100'} transition-opacity`}
                />
              </div>
            ))}
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
              </span> of your (rea)search.
            </h2>
            
            <p className={`text-xl ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-12 max-w-3xl mx-auto font-vastago`}>
              Tell us about your career history and goals. We&apos;ll help you craft a standout profile
              and help you land your dream research opportunity.
            </p>
          </div>

          {/* Job Matches Section */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
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
              
              <DxButton 
                destination="/matches"
                bgColor={isDark ? 'bg-[#d1cfbf]' : 'bg-claude-orange'}
                textColor={isDark ? 'text-[#1a1a1a]' : 'text-white'}
                hoverColor={isDark ? 'hover:bg-[#c1bfaf]' : 'hover:bg-claude-orange/90'}
                shadow="shadow-md"
                padding="px-8 py-3"
                rounded="rounded-full"
              >
                Get Matched Now
              </DxButton>
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
              <DxButton 
                destination="/signup"
                bgColor={isDark ? 'bg-[#d1cfbf]' : 'bg-white'}
                textColor={isDark ? 'text-[#1a1a1a]' : 'text-claude-orange'}
                hoverColor={isDark ? 'hover:bg-[#c1bfaf]' : 'hover:bg-gray-100'}
                shadow="shadow-md"
                padding="px-8 py-3"
                rounded="rounded-full"
              >
                Create Free Account
              </DxButton>
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