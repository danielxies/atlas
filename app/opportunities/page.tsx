'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../lib/hooks/useTheme';
import { vastago } from '../fonts';
import { Professor } from '@/components/custom/ProfessorCard';
import Navbar from '../components/shared/Navbar';
import TabbedApplyModal from '@/components/custom/TabbedApplyModal';
import { updateAppliedProfessors, generateEmailDraft, createMailtoLink } from '@/utils/emailUtils';
import Image from 'next/image';

export default function ResearchOpportunities() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { isDark, setIsDark } = useTheme();

  // State variables
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // User profile state
  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [otherLinks, setOtherLinks] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState('');
  const [researchSummary, setResearchSummary] = useState('');
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');

  // Email and application state
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [backupMailtoLink, setBackupMailtoLink] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  // Check if profile is complete and redirect if not
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const checkProfileCompletion = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('university, major')
        .eq('clerk_id', user.id)
        .single();

      if (error) {
        console.error('Error checking profile completion:', error);
        return;
      }

      // If university or major is missing, redirect to profile completion
      if (!data || !data.university || !data.major) {
        router.push('/profile-completion');
      }
    };

    checkProfileCompletion();
  }, [isLoaded, isSignedIn, user, router]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
  
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          resume,
          linkedin,
          github,
          portfolio,
          other_links,
          research_summary,
          research_interests,
          skills,
          email,
          subscribed,
          resume_text,
          university,
          major,
          applied_professors
        `)
        .eq('clerk_id', user.id)
        .single();
  
      if (error) {
        console.error('Error fetching profile:', error.message);
      } else if (data) {
        setResumeUrl(data.resume || '');
        setLinkedin(data.linkedin || '');
        setGithub(data.github || '');
        setOtherLinks(data.other_links || []);
        setPortfolio(data.portfolio || '');
        setResearchSummary(data.research_summary || '');
        setResearchInterests(data.research_interests || []);
        setSkills(data.skills || []);
        setEmail(data.email || '');
        setResumeText(data.resume_text || '');
        setSubscribed(data.subscribed ?? false);
        setUniversity(data.university || '');
        setMajor(data.major || '');
      }
    };
  
    fetchUserProfile();
  }, [user]);
  
  // Fetch professor data from API
  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        setIsDataLoading(true);
        const response = await fetch('/api/professors');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setProfessors(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchProfessors();
  }, []);

  // Event handlers
  const openModal = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsModalOpen(true);
    setIsApplying(false);
    setHasApplied(false);
    setBackupMailtoLink('');
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setShowApplyModal(false);
    setSelectedProfessor(null);
  };

  const handleComposeEmail = async (professor: Professor) => {
    if (!user) return;
    setIsApplying(true);
  
    try {
      // Update applied professors list in Supabase
      await updateAppliedProfessors(user.id, professor);
      
      // Generate email draft
      const userDetails = {
        id: user.id,
        fullName: user.fullName,
        researchInterests,
        experience: researchSummary,
        skills,
        resumeUrl,
        linkedin,
        github,
        otherLinks,
        university,
        major,
      };
      
      const emailContent = await generateEmailDraft(professor, userDetails);
      
      setDraftEmail(emailContent);
      setSelectedProfessor(professor);
      setIsModalOpen(false);
      setShowApplyModal(true);
      setHasApplied(true);
    } catch (err) {
      console.error('Error in email composition process:', err);
      alert('An error occurred while generating your email.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleMailto = () => {
    if (!selectedProfessor) return;
    const mailtoLink = createMailtoLink(selectedProfessor.email, draftEmail);
    window.open(mailtoLink, '_blank');
  };

  if (!isLoaded || !isSignedIn || isDataLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'}`}>
        <p className="font-vastago">Loading...</p>
      </div>
    );
  }

  // Get 3 random professors for opportunities display
  const getRandomProfessors = (count: number) => {
    if (professors.length <= count) return professors.slice(0, count);
    
    const shuffled = [...professors].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const recommendedOpportunities = getRandomProfessors(3);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'} ${vastago.variable} flex flex-col font-vastago`}>
      {/* Header */}
      <Navbar isDark={isDark} setIsDark={setIsDark} />
      
      {/* Horizontal divider line */}
      <div className={`w-full h-px ${isDark ? 'bg-[#333]' : 'bg-gray-200'}`}></div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Profile Section */}
          <div className="lg:w-1/4 font-vastago">
            {/* Profile Card */}
            <div className={`rounded-lg overflow-hidden shadow mb-4 ${isDark ? 'bg-[#2a2a2a] border border-[#333]' : 'bg-white border border-gray-200'}`}>
              {/* Banner Image */}
              <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {/* Profile Image */}
                <div className="absolute -bottom-12 left-4">
                  <div className={`w-24 h-24 rounded-full border-4 ${isDark ? 'border-[#2a2a2a]' : 'border-white'} overflow-hidden bg-gray-300`}>
                    {user?.imageUrl ? (
                      <Image 
                        src={user.imageUrl} 
                        alt="Profile" 
                        width={96} 
                        height={96} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                        <span className="text-2xl font-bold">{user?.firstName?.charAt(0) || user?.username?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="pt-14 pb-4 px-4">
                <h2 className={`text-xl font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>
                  {user?.fullName?.toLowerCase() || user?.firstName?.toLowerCase() || user?.username?.toLowerCase()}
                </h2>
                <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'}`}>
                  {university} {major && `• ${major}`}
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'}`}>
                  {researchInterests.length > 0 ? 
                    `Interested in: ${researchInterests.slice(0, 2).join(', ')}${researchInterests.length > 2 ? '...' : ''}` : 
                    'Research interests not specified'}
                </p>
              </div>
            </div>

            {/* My Jobs Section */}
            <div className={`rounded-lg shadow ${isDark ? 'bg-[#2a2a2a] border border-[#333]' : 'bg-white border border-gray-200'}`}>
              <div className="p-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} mb-2`}>
                  My Jobs
                </h3>
                
                {/* Tabs */}
                <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-3`}>
                  <button 
                    className={`pb-2 px-4 text-sm border-b-2 ${isDark ? 'text-claude-orange border-claude-orange' : 'text-claude-orange border-claude-orange'}`}
                  >
                    Saved
                  </button>
                </div>
                
                {/* Empty state for saved jobs */}
                <div className={`py-8 text-center ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'}`}>
                  <div className="inline-block mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <p className="text-sm">No saved opportunities</p>
                  <p className="text-xs mt-1">Save opportunities to view them later</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Opportunities Listings */}
          <div className="lg:w-3/4">
            {/* Recommended Opportunities */}
            <div className={`rounded-lg shadow ${isDark ? 'bg-[#2a2a2a] border border-[#333]' : 'bg-white border border-gray-200'} mb-4`}>
              <div className="p-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} mb-4`}>
                  Recommended Opportunities
                </h3>

                <div className={`${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {recommendedOpportunities.map((professor, index) => (
                    <div 
                      key={professor.profile_link} 
                      className={`py-4 cursor-pointer hover:${isDark ? 'bg-[#333333]' : 'bg-gray-50'} transition rounded-md p-2 ${
                        index < recommendedOpportunities.length - 1 ? (isDark ? 'border-b border-gray-700' : 'border-b border-gray-200') : ''
                      }`}
                      onClick={() => openModal(professor)}
                    >
                      <div className="flex">
                        {/* Logo placeholder */}
                        <div className={`w-12 h-12 rounded flex items-center justify-center mr-3 flex-shrink-0 ${
                          isDark ? 'bg-[#333333] text-[#d1cfbf]' : 'bg-gray-200 text-gray-700'
                        }`}>
                          <span className="text-xl font-bold">
                            {professor.department.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Opportunity details */}
                        <div className="flex-grow">
                          <h4 
                            className={`text-base font-medium ${isDark ? 'text-[#d1cfbf] hover:text-claude-orange' : 'text-gray-900 hover:text-claude-orange'}`}
                          >
                            {professor.name}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'}`}>
                            {professor.department}
                          </p>
                          
                          {/* Research areas as tags */}
                          {professor.research_areas && professor.research_areas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {professor.research_areas.slice(0, 3).map((area, index) => (
                                <span 
                                  key={index} 
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-[#f1f1f1] text-gray-700'
                                  }`}
                                >
                                  {typeof area === 'string' ? area.replace(/[[\]']+/g, '') : ''}
                                </span>
                              ))}
                              {professor.research_areas.length > 3 && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  isDark ? 'bg-[#333333] text-[#d1cfbf]/80' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  +{professor.research_areas.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Research description preview */}
                          <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'}`}>
                            {professor.research_description || 'No description available'}
                          </p>
                        </div>

                        {/* Close button (just visually) */}
                        <div className="self-start">
                          <button className={`p-1 rounded-full ${isDark ? 'text-[#d1cfbf]/60 hover:bg-[#333333]' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show All Button */}
                <div className="mt-6 text-center">
                  <a href="/opportunities/all" className={`inline-flex items-center ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'}`}>
                    <span>Show all</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <TabbedApplyModal
        professor={selectedProfessor!}
        isOpen={isModalOpen || showApplyModal}
        onClose={closeModal}
        onApply={() => selectedProfessor && handleComposeEmail(selectedProfessor)}
        isApplying={isApplying}
        hasApplied={hasApplied}
        backupMailtoLink={backupMailtoLink}
        draftEmail={draftEmail}
        setDraftEmail={setDraftEmail}
        handleMailto={handleMailto}
        isDark={isDark}
      />
    </div>
  );
}
