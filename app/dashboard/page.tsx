'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../lib/hooks/useTheme';
import { alice, vastago } from '../fonts';
import { BookOpen, Beaker, Rocket } from 'lucide-react';

// Import components
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import OpportunityCard from '../components/dashboard/OpportunityCard';
import ScrollableSection from '../components/dashboard/ScrollableSection';
import DetailModal from '../components/dashboard/DetailModal';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';

// Import types
import { 
  ResearchProgram, 
  ResearchProject, 
  LastMinuteOpportunity,
  DeadlineItem
} from '../types/dashboard';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { isDark, setIsDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  
  // State for modal display
  const [selectedProgram, setSelectedProgram] = useState<ResearchProgram | null>(null);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<LastMinuteOpportunity | null>(null);
  
  // State for data
  const [researchPrograms, setResearchPrograms] = useState<ResearchProgram[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [lastMinuteOpportunities, setLastMinuteOpportunities] = useState<LastMinuteOpportunity[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<DeadlineItem[]>([
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

  // Check if profile is complete and retrieve user data
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

  // Handle data fallback for user name
  useEffect(() => {
    if (isSignedIn && user && user.firstName && firstName === '') {
      // Set a fallback name from Clerk if Supabase failed to load
      setFirstName(user.firstName);
    }
  }, [isSignedIn, user, firstName]);

  // Close all modals
  const closeModals = () => {
    setSelectedProgram(null);
    setSelectedProject(null);
    setSelectedOpportunity(null);
  };

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
          <ScrollableSection 
            id="last-minute-opportunities"
            title="Last Minute Summer Opportunities"
            icon={Rocket}
            isDark={isDark}
          >
            {lastMinuteOpportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity.id}
                item={opportunity}
                isDark={isDark}
                onClick={() => setSelectedOpportunity(opportunity)}
                imageUrl={spaceImages[index % spaceImages.length]}
              />
            ))}
          </ScrollableSection>
        )}
        
        {/* Research Programs Section */}
        <ScrollableSection 
          id="research-programs"
          title="Research Programs"
          icon={BookOpen}
          isDark={isDark}
        >
          {researchPrograms.map((program) => (
            <OpportunityCard
              key={program.id}
              item={program}
              isDark={isDark}
              onClick={() => setSelectedProgram(program)}
            />
          ))}
        </ScrollableSection>
        
        {/* Individual Research Projects */}
        <ScrollableSection 
          id="individual-research"
          title="Individual Research"
          icon={Beaker}
          isDark={isDark}
        >
          {researchProjects.map((project) => (
            <OpportunityCard
              key={project.id}
              item={project}
              isDark={isDark}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </ScrollableSection>
        
        {/* Upcoming Deadlines */}
        <UpcomingDeadlines 
          deadlines={upcomingDeadlines}
          isDark={isDark}
        />
      </main>
      
      <Footer isDark={isDark} />
      
      {/* Use DetailModal for all our modal types */}
      {selectedProgram && (
        <DetailModal 
          item={selectedProgram}
          isDark={isDark}
          onClose={closeModals}
        />
      )}
      
      {selectedProject && (
        <DetailModal 
          item={selectedProject}
          isDark={isDark}
          onClose={closeModals}
        />
      )}
      
      {selectedOpportunity && (
        <DetailModal 
          item={selectedOpportunity}
          isDark={isDark}
          onClose={closeModals}
          imageUrl={spaceImages[lastMinuteOpportunities.findIndex(o => o.id === selectedOpportunity.id) % spaceImages.length]}
        />
      )}
    </div>
  );
}
