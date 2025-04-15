'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../lib/hooks/useTheme';
import { alice, vastago } from '../fonts';
import { ChevronRight, ChevronLeft, BookOpen, Beaker, GraduationCap, Award, X, Rocket } from 'lucide-react';
import Link from 'next/link';

// Import components
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

interface ResearchProgram {
  id: string;
  title: string;
  institution: string;
  deadline: string;
  thumbnailUrl: string;
  description?: string;
  location?: string;
  duration?: string;
  eligibility?: string;
  funding?: string;
  applicationUrl?: string;
  department?: string;
  tags?: string[];
}

interface ResearchProject {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  professorName?: string;
  department?: string;
  description?: string;
  skills?: string[];
  tags?: string[];
}

interface LastMinuteOpportunity {
  id: string;
  title: string;
  institution: string;
  department: string;
  deadline: string;
  description: string;
  location: string;
  duration: string;
  eligibility: string;
  funding: string;
  applicationUrl: string;
  majors?: string[];
  tags?: string[];
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { isDark, setIsDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ResearchProgram | null>(null);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<LastMinuteOpportunity | null>(null);
  
  // State for programs and projects
  const [researchPrograms, setResearchPrograms] = useState<ResearchProgram[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [lastMinuteOpportunities, setLastMinuteOpportunities] = useState<LastMinuteOpportunity[]>([]);
  
  // Sample data for upcoming deadlines
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([
    {
      id: '1',
      title: 'NSF Graduate Research Fellowship',
      deadline: '2023-04-10',
      type: 'Fellowship'
    },
    {
      id: '2',
      title: 'Research Paper Submission - Nature',
      deadline: '2023-04-15',
      type: 'Publication'
    },
    {
      id: '3',
      title: 'International Conference on AI',
      deadline: '2023-05-01',
      type: 'Conference'
    }
  ]);

  // Load data from JSON files
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data
        const dashboardResponse = await fetch('/dashboard_data.json');
        const dashboardData = await dashboardResponse.json();
        setResearchPrograms(dashboardData.researchPrograms);
        setResearchProjects(dashboardData.individualResearchProjects);
        
        // Fetch last minute opportunities
        const lastMinuteResponse = await fetch('/dashboard_lastminute.json');
        const lastMinuteData = await lastMinuteResponse.json();
        setLastMinuteOpportunities(lastMinuteData.lastMinuteOpportunities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Redirect to login if not authenticated once auth is loaded
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  // New effect to check if profile is complete and redirect if not
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    const checkProfileCompletion = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('clerk_id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          setLoading(false);
          return;
        }
        
        // Set the user's first name if available
        if (data && data.first_name) {
          setFirstName(data.first_name);
        } else if (user.firstName) {
          setFirstName(user.firstName);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setLoading(false);
        
        // Set fallback from Clerk user data
        if (user.firstName) {
          setFirstName(user.firstName);
        }
      }
    };

    checkProfileCompletion();
  }, [isLoaded, isSignedIn, user, router]);

  // Horizontal scroll handler
  const scroll = (id: string, direction: 'left' | 'right') => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fix loading timeout issue
  useEffect(() => {
    // Force exit loading state after 5 seconds if it's stuck
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Forcing exit from loading state due to timeout');
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Handle data fallback (simplified check)
  useEffect(() => {
    if (isSignedIn && user && user.firstName && firstName === '') {
      // Set a fallback name from Clerk if Supabase failed to load
      setFirstName(user.firstName);
    }
  }, [isSignedIn, user, firstName]);

  // Open modal for program details
  const openProgramModal = (program: ResearchProgram) => {
    setSelectedProgram(program);
  };
  
  // Open modal for project details
  const openProjectModal = (project: ResearchProject) => {
    setSelectedProject(project);
  };
  
  // Open modal for last minute opportunity details
  const openOpportunityModal = (opportunity: LastMinuteOpportunity) => {
    setSelectedOpportunity(opportunity);
  };
  
  // Close all modals
  const closeModals = () => {
    setSelectedProgram(null);
    setSelectedProject(null);
    setSelectedOpportunity(null);
  };

  // Space themed image URLs for last minute opportunities
  const spaceImages = [
    "https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80", // Galaxy
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Stars
    "https://images.unsplash.com/photo-1484589065579-248aad0d8b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1959&q=80", // Rocket launch
    "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Planet Earth
    "https://images.unsplash.com/photo-1534996858221-380b92700493?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80", // Space walk
    "https://images.unsplash.com/photo-1581822261290-991b38693d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Moon
    "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-4.0.3&auto=format&fit=crop&w=2080&q=80", // Nebula
    "https://images.unsplash.com/photo-1501862700950-18382cd41497?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80", // Space sunset
    "https://images.unsplash.com/photo-1543722530-d2c3201371e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80", // Satellite
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"  // Northern lights
  ];

  // Only block rendering if auth isn't loaded yet
  if (!isLoaded || !isSignedIn) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center initial-loading transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'}`}>
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
            Loading your dashboard...
          </p>
          {supabaseError && (
            <p className="text-red-500 mt-2 text-sm">
              Error: {supabaseError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Continue with UI even if some data is missing
  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'} ${alice.variable} ${vastago.variable}`}>
      <Navbar isDark={isDark} setIsDark={setIsDark} />

      <main className="flex-grow px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Show loading indicator at the top if still fetching data */}
        {loading && (
          <div className="mb-8 flex justify-center">
            <div className="flex space-x-3 items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-claude-orange"></div>
              <p className="text-sm opacity-70">Loading your data...</p>
            </div>
          </div>
        )}
        
        {/* Greeting Section */}
        <section className="mb-12">
          <h1 className={`text-4xl ${vastago.className} mb-3 ${isDark ? 'text-[#d1cfbf]' : 'text-black'}`}>
            Hi, {firstName || user?.firstName || 'Researcher'}
          </h1>
          <p className={`text-lg ${alice.className} opacity-80`}>
            Welcome to your research dashboard. Track your progress and discover new opportunities.
          </p>
        </section>
        
        {/* Last Minute Summer Opportunities Section */}
        {lastMinuteOpportunities.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Rocket className={`${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`} />
                <h2 className={`text-2xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} ${vastago.className}`}>Last Minute Summer Opportunities</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => scroll('last-minute-opportunities', 'left')}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-[#d1cfbf]' : 'hover:bg-gray-200 text-gray-700'}`}
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scroll('last-minute-opportunities', 'right')}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-[#d1cfbf]' : 'hover:bg-gray-200 text-gray-700'}`}
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div id="last-minute-opportunities" className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
              {lastMinuteOpportunities.map((opportunity, index) => (
                <div
                  key={opportunity.id}
                  className={`flex-none w-80 rounded-lg overflow-hidden shadow-lg ${isDark ? 'bg-[#262626] hover:bg-[#2e2e2e]' : 'bg-white hover:bg-gray-50'} transition-colors`}
                >
                  <div className="h-44 overflow-hidden">
                    <img
                      src={spaceImages[index % spaceImages.length]}
                      alt={opportunity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className={`text-lg font-semibold mb-1 ${alice.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>{opportunity.title}</h3>
                    <p className={`text-sm ${vastago.className} ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-700'}`}>{opportunity.institution}</p>
                    <p className={`text-sm ${vastago.className} ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-600'} mt-2`}>
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <button
                      onClick={() => openOpportunityModal(opportunity)}
                      className={`mt-4 text-sm font-medium px-4 py-2 rounded ${isDark ? 'bg-claude-orange/90 hover:bg-claude-orange text-[#1a1a1a]' : 'bg-claude-orange-dark hover:bg-claude-orange text-white'} transition-colors ${vastago.className}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Research Programs Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className={`${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`} />
              <h2 className={`text-2xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} ${vastago.className}`}>Research Programs</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => scroll('research-programs', 'left')}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-[#d1cfbf]' : 'hover:bg-gray-200 text-gray-700'}`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll('research-programs', 'right')}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-[#d1cfbf]' : 'hover:bg-gray-200 text-gray-700'}`}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div id="research-programs" className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
            {researchPrograms.map((program) => (
              <div
                key={program.id}
                className={`flex-none w-80 rounded-lg overflow-hidden shadow-lg ${isDark ? 'bg-[#262626] hover:bg-[#2e2e2e]' : 'bg-white hover:bg-gray-50'} transition-colors`}
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={program.thumbnailUrl}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className={`text-lg font-semibold mb-1 ${alice.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>{program.title}</h3>
                  <p className={`text-sm ${vastago.className} ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-700'}`}>{program.institution}</p>
                  <p className={`text-sm ${vastago.className} ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-600'} mt-2`}>
                    Deadline: {new Date(program.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <button
                    onClick={() => openProgramModal(program)}
                    className={`mt-4 text-sm font-medium px-4 py-2 rounded ${isDark ? 'bg-claude-orange/90 hover:bg-claude-orange text-[#1a1a1a]' : 'bg-claude-orange-dark hover:bg-claude-orange text-white'} transition-colors ${vastago.className}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Individual Research Projects */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Beaker className={`${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`} />
              <h2 className={`text-2xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} ${vastago.className}`}>Individual Research</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => scroll('individual-research', 'left')}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-[#d1cfbf]' : 'hover:bg-gray-200 text-gray-700'}`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll('individual-research', 'right')}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-[#d1cfbf]' : 'hover:bg-gray-200 text-gray-700'}`}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div id="individual-research" className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
            {researchProjects.map((project) => (
              <div
                key={project.id}
                className={`flex-none w-80 p-4 rounded-lg ${isDark ? 'bg-[#262626] hover:bg-[#2e2e2e]' : 'bg-white hover:bg-gray-50'} shadow-lg transition-colors`}
              >
                <h3 className={`text-lg font-semibold mb-1 ${alice.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>{project.title}</h3>
                <p className={`text-sm ${vastago.className} ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-700'}`}>{project.category}</p>
                <div className={`flex items-center mt-4 text-sm ${vastago.className} ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-600'}`}>
                  <span>Updated: {new Date(project.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <button
                  onClick={() => openProjectModal(project)}
                  className={`mt-4 text-sm font-medium px-4 py-2 rounded ${isDark ? 'bg-claude-orange/90 hover:bg-claude-orange text-[#1a1a1a]' : 'bg-claude-orange-dark hover:bg-claude-orange text-white'} transition-colors ${vastago.className}`}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>
        
        {/* Upcoming Deadlines */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <BookOpen className={`mr-2 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} />
            <h2 className={`text-2xl ${vastago.className}`}>Upcoming Deadlines</h2>
          </div>
          
          <div className={`rounded-lg ${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} shadow-md overflow-hidden`}>
            {upcomingDeadlines.map((deadline, index) => (
              <div 
                key={deadline.id}
                className={`p-4 flex justify-between items-center ${
                  index !== upcomingDeadlines.length - 1 
                    ? `border-b ${isDark ? 'border-[#3a3a3a]' : 'border-gray-200'}` 
                    : ''
                }`}
              >
                <div>
                  <h3 className={`${vastago.className} text-lg`}>{deadline.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-[#e0decf] text-black'
                    }`}>
                      {deadline.type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-medium ${
                    new Date(deadline.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      ? 'text-red-500'
                      : isDark ? 'text-[#d1cfbf]' : 'text-black'
                  }`}>
                    {new Date(deadline.deadline).toLocaleDateString()}
                  </span>
                  <span className="text-xs opacity-70 mt-1">
                    {Math.ceil((new Date(deadline.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <Footer isDark={isDark} />
      
      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={closeModals}
            >
              <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-500/75'}`}></div>
            </div>

            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full ${isDark ? 'bg-[#262626] text-[#d1cfbf]' : 'bg-white text-gray-900'}`}>
              {/* Modal header with image */}
              <div className="relative h-56 w-full">
                <img
                  src={selectedProgram.thumbnailUrl}
                  alt={selectedProgram.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 p-2">
                  <button 
                    onClick={closeModals}
                    className={`p-2 rounded-full ${isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'} transition`}
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>
              
              {/* Modal content */}
              <div className="p-6">
                <h3 className={`text-2xl font-bold mb-2 ${alice.className}`}>{selectedProgram.title}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`text-sm px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'} ${vastago.className}`}>
                    {selectedProgram.institution}
                  </div>
                  {selectedProgram.department && (
                    <div className={`text-sm px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'} ${vastago.className}`}>
                      {selectedProgram.department}
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className={`mb-4 ${vastago.className} ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'}`}>
                    {selectedProgram.description || "No description available."}
                  </div>
                  
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 mb-4">
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Location</dt>
                      <dd className="mt-1 text-sm">{selectedProgram.location || selectedProgram.institution}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Duration</dt>
                      <dd className="mt-1 text-sm">{selectedProgram.duration || "Not specified"}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Deadline</dt>
                      <dd className="mt-1 text-sm">{new Date(selectedProgram.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Funding</dt>
                      <dd className="mt-1 text-sm">{selectedProgram.funding || "Information not available"}</dd>
                    </div>
                  </dl>
                  
                  {selectedProgram.eligibility && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Eligibility</h4>
                      <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'}`}>{selectedProgram.eligibility}</p>
                    </div>
                  )}
                  
                  {selectedProgram.tags && selectedProgram.tags.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Research Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProgram.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-claude-orange/20 text-claude-orange/90' : 'bg-claude-orange/10 text-claude-orange-dark'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-4 border-t pt-4 border-gray-200">
                  {selectedProgram.applicationUrl && (
                    <a
                      href={selectedProgram.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 text-sm font-medium rounded ${isDark ? 'bg-claude-orange text-black hover:bg-claude-orange/90' : 'bg-claude-orange-dark text-white hover:bg-claude-orange/90'} transition-colors ${vastago.className}`}
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={closeModals}
            >
              <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-500/75'}`}></div>
            </div>

            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full ${isDark ? 'bg-[#262626] text-[#d1cfbf]' : 'bg-white text-gray-900'}`}>
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={closeModals}
                  className="rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-claude-orange-dark"
                >
                  <X size={24} className={isDark ? 'text-[#d1cfbf]' : 'text-gray-500'} />
                </button>
              </div>
              
              {/* Modal content */}
              <div className="p-6">
                <h3 className={`text-2xl font-bold mb-2 ${alice.className} pr-8`}>{selectedProject.title}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  {selectedProject.department && (
                    <div className={`text-sm px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'} ${vastago.className}`}>
                      {selectedProject.department}
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="mb-4">
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Description</h4>
                    <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'}`}>
                      {selectedProject.description || "No description available."}
                    </p>
                  </div>
                  
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 mb-4">
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Category</dt>
                      <dd className="mt-1 text-sm">{selectedProject.category}</dd>
                    </div>
                    {selectedProject.professorName && (
                      <div className="sm:col-span-1">
                        <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Professor</dt>
                        <dd className="mt-1 text-sm">{selectedProject.professorName}</dd>
                      </div>
                    )}
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Last Updated</dt>
                      <dd className="mt-1 text-sm">{new Date(selectedProject.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                    </div>
                  </dl>
                  
                  {selectedProject.skills && selectedProject.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Research Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-claude-orange/20 text-claude-orange/90' : 'bg-claude-orange/10 text-claude-orange-dark'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Last Minute Opportunity Details Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={closeModals}
            >
              <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-500/75'}`}></div>
            </div>

            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full ${isDark ? 'bg-[#262626] text-[#d1cfbf]' : 'bg-white text-gray-900'}`}>
              {/* Modal header with image */}
              <div className="relative h-56 w-full">
                <img
                  src={spaceImages[lastMinuteOpportunities.findIndex(o => o.id === selectedOpportunity.id) % spaceImages.length]}
                  alt={selectedOpportunity.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 p-2">
                  <button 
                    onClick={closeModals}
                    className={`p-2 rounded-full ${isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'} transition`}
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>
              
              {/* Modal content */}
              <div className="p-6">
                <h3 className={`text-2xl font-bold mb-2 ${alice.className}`}>{selectedOpportunity.title}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`text-sm px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'} ${vastago.className}`}>
                    {selectedOpportunity.institution}
                  </div>
                  {selectedOpportunity.department && (
                    <div className={`text-sm px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'} ${vastago.className}`}>
                      {selectedOpportunity.department}
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className={`mb-4 ${vastago.className} ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'}`}>
                    {selectedOpportunity.description.replace(/&#8203;:contentReference\[oaicite:\d+\]\{index=\d+\}/g, "")}
                  </div>
                  
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 mb-4">
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Location</dt>
                      <dd className="mt-1 text-sm">{selectedOpportunity.location}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Duration</dt>
                      <dd className="mt-1 text-sm">{selectedOpportunity.duration}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Deadline</dt>
                      <dd className="mt-1 text-sm">{new Date(selectedOpportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Funding</dt>
                      <dd className="mt-1 text-sm">{selectedOpportunity.funding.replace(/&#8203;:contentReference\[oaicite:\d+\]\{index=\d+\}/g, "")}</dd>
                    </div>
                  </dl>
                  
                  <div className="mb-4">
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Eligibility</h4>
                    <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'}`}>
                      {selectedOpportunity.eligibility.replace(/&#8203;:contentReference\[oaicite:\d+\]\{index=\d+\}/g, "")}
                    </p>
                  </div>
                  
                  {selectedOpportunity.majors && selectedOpportunity.majors.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Relevant Majors</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedOpportunity.majors.map((major, index) => (
                          <span 
                            key={index} 
                            className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {major}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedOpportunity.tags && selectedOpportunity.tags.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedOpportunity.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-claude-orange/20 text-claude-orange/90' : 'bg-claude-orange/10 text-claude-orange-dark'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-4 border-t pt-4 border-gray-200">
                  {selectedOpportunity.applicationUrl && (
                    <a
                      href={selectedOpportunity.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 text-sm font-medium rounded ${isDark ? 'bg-claude-orange text-black hover:bg-claude-orange/90' : 'bg-claude-orange-dark text-white hover:bg-claude-orange/90'} transition-colors ${vastago.className}`}
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
