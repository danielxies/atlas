'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../../lib/hooks/useTheme';
import { vastago } from '../../fonts';
import { Professor } from '@/components/custom/ProfessorCard';
import OpportunitiesNavbar from '../../components/shared/OpportunitiesNavbar';
import { updateAppliedProfessors, generateEmailDraft, createMailtoLink } from '@/utils/emailUtils';
import Image from 'next/image';
import DxButton from '@/components/danielxie/dxButton';

export default function AllOpportunities() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { isDark, setIsDark } = useTheme();

  // State variables
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'editor'>('info');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedMajor, setSelectedMajor] = useState<string>('');
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  
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
        
        // Select the first professor by default if none is selected
        if (data.length > 0 && !selectedProfessor) {
          setSelectedProfessor(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchProfessors();
  }, []);

  // Event handlers
  const handleProfessorClick = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsApplying(false);
    setHasApplied(false);
    setBackupMailtoLink('');
    setActiveTab('info');
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
      setHasApplied(true);
      setActiveTab('editor');
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

  // Apply filters to professors
  useEffect(() => {
    if (!professors.length) return;
    
    // Just show all professors regardless of filters
    // setFilteredProfessors(professors); // Removed old logic
  }, [professors]);

  // Run search functionality removed - we keep the effect for state updates
  // useEffect(() => {
  //   if (professors.length) {
  //     // Set all professors regardless of search query or filters
  //     setFilteredProfessors(professors);
  //   }
  // }, [searchQuery, selectedMajor, selectedSchool, professors]);

  // Apply search and filters dynamically
  useEffect(() => {
    let currentFiltered = professors;

    // Filter by search query (name)
    if (searchQuery) {
      currentFiltered = currentFiltered.filter(professor =>
        professor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected major
    if (selectedMajor) {
      currentFiltered = currentFiltered.filter(professor => 
        (professor.department.toLowerCase() === selectedMajor.toLowerCase()) ||
        (professor.preferred_majors.some(major => major.toLowerCase() === selectedMajor.toLowerCase()))
      );
    }

    // TODO: Add filtering logic for selectedSchool here if needed later

    setFilteredProfessors(currentFiltered);
    console.log(`Search Query: "${searchQuery}", Selected Major: "${selectedMajor}", Filtered Professors:`, currentFiltered.map(p => p.name)); // Log filtered names
  }, [searchQuery, selectedMajor, selectedSchool, professors]); // Dependencies updated

  // Create a memoized list with unique keys to prevent rendering issues
  const uniqueFilteredProfessors = useMemo(() => {
    const seenKeys = new Set<string>();
    const uniqueList: Professor[] = [];
    filteredProfessors.forEach(professor => {
      const key = `${professor.profile_link}-${professor.name}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueList.push(professor);
      } else {
        // Log duplicates that are being skipped for rendering
        console.warn(`Skipping duplicate professor entry for key: ${key}`);
      }
    });
    return uniqueList;
  }, [filteredProfessors]);

  // Handle search functionality - now just a placeholder
  const handleSearch = () => {
    // Search is now handled dynamically by the useEffect above
    // This function could be repurposed or removed if no explicit search button exists
    console.log("Search triggered (handled by useEffect)");
  };

  // Get unique departments for filter options
  const departments = Array.from(new Set(professors.map(prof => prof.department))).sort();

  // Get unique preferred majors for filter options
  const preferredMajors = Array.from(
    new Set(
      professors.flatMap(prof => 
        prof.preferred_majors.map(major => major.trim()).filter(Boolean)
      )
    )
  ).sort();

  // Combined unique majors and departments for filtering
  const majorOptions = Array.from(new Set([...departments, ...preferredMajors])).sort();

  const applyFilters = () => {
    // Filter functionality removed
    setFilteredProfessors(professors);
  };

  const resetFilters = () => {
    setSelectedSchool('');
    setSelectedMajor('');
    setSearchQuery('');
    setFilteredProfessors(professors);
  };

  if (!isLoaded || !isSignedIn || isDataLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'}`}>
        <p className="font-vastago">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`h-screen ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'} ${vastago.variable} flex flex-col font-vastago overflow-hidden`}>
      {/* Header with search */}
      <OpportunitiesNavbar 
        isDark={isDark} 
        setIsDark={setIsDark}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        selectedMajor={selectedMajor}
        setSelectedMajor={setSelectedMajor}
        departments={majorOptions}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        handleSearch={handleSearch}
      >
        <div className="flex items-center ml-4">
          <Image 
            src="/logos/purdue.png" 
            alt="Purdue Logo" 
            width={24} 
            height={24}
            className="mr-2"
          />
        </div>
      </OpportunitiesNavbar>

      {/* Horizontal divider line */}
      <div className={`w-full h-px ${isDark ? 'bg-[#333]' : 'bg-gray-200'}`}></div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Page Content */}
        <div className="flex h-full">
          {/* Left Column - Professor List */}
          <div className="w-[30%] h-full">
            <div className={`h-full ${isDark ? 'bg-[#161616] border-r border-[#333]' : 'bg-white border-r border-gray-200'}`}>
              <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'} h-[calc(100vh-61px)] overflow-y-auto`}>
                {uniqueFilteredProfessors.map((professor) => (
                  <div 
                    key={`${professor.profile_link}-${professor.name}`}
                    className={`p-4 cursor-pointer transition ${
                      selectedProfessor?.profile_link === professor.profile_link
                        ? isDark 
                          ? 'bg-[#2a2a2a]' 
                          : 'bg-gray-100'
                        : ''
                    } hover:${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
                    onClick={() => handleProfessorClick(professor)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo placeholder */}
                      <div className={`w-12 h-12 rounded flex items-center justify-center flex-shrink-0 ${
                        isDark ? 'bg-[#333333] text-[#d1cfbf]' : 'bg-gray-200 text-gray-700'
                      }`}>
                        <span className="text-lg font-bold">
                          {professor.department.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Opportunity details */}
                      <div className="flex-grow">
                        <h4 
                          className={`text-base font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}
                        >
                          {professor.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'}`}>
                          {professor.department}
                        </p>

                        {/* Research areas preview */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {professor.research_areas.slice(0, 2).map((area, index) => (
                            <span 
                              key={index} 
                              className={`text-xs px-2 py-1 rounded-full ${
                                isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-[#f1f1f1] text-gray-700'
                              }`}
                            >
                              {typeof area === 'string' ? area.replace(/[[\]']+/g, '') : ''}
                            </span>
                          ))}
                          {professor.research_areas.length > 2 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-[#333333] text-[#d1cfbf]/80' : 'bg-gray-100 text-gray-700'
                            }`}>
                              +{professor.research_areas.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Professor Detail */}
          <div className="w-[70%] h-full">
            {selectedProfessor ? (
              <div className={`h-full flex flex-col ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                {/* Header */}
                <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                  <h2 className={`text-2xl font-medium ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`}>
                    {selectedProfessor.name}
                  </h2>
                  <p className={`text-lg ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'}`}>
                    {selectedProfessor.department}
                  </p>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                  <button 
                    className={`px-4 py-2 ${
                      activeTab === 'info'
                        ? isDark
                          ? 'border-b-2 border-claude-orange text-[#d1cfbf]'
                          : 'border-b-2 border-claude-orange-dark text-gray-900'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('info')}
                  >
                    Professor Info
                  </button>
                  <button 
                    className={`px-4 py-2 ${
                      activeTab === 'editor'
                        ? isDark
                          ? 'border-b-2 border-claude-orange text-[#d1cfbf]'
                          : 'border-b-2 border-claude-orange-dark text-gray-900'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('editor')}
                  >
                    Email Editor
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-grow overflow-y-auto">
                  {activeTab === 'info' ? (
                    <div className="p-6 grid md:grid-cols-3 gap-8">
                      {/* LEFT COLUMN */}
                      <div className="md:col-span-2 space-y-6">
                        <div>
                          <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`}>
                            Research Description
                          </h3>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>
                            {selectedProfessor.research_description}
                          </p>
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`}>
                            Research Areas
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProfessor.research_areas.map((area, i) => (
                              <span key={i}
                                    className={`px-3 py-1 rounded-full text-sm ${
                                      isDark
                                        ? 'bg-[#3a3a3a] text-[#d1cfbf]'
                                        : 'bg-[#f1f1f1] text-gray-700'
                                    }`}>
                                {typeof area === 'string' ? area.replace(/[[\]']+/g, '') : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className={`${isDark ? 'bg-[#212121]' : 'bg-gray-50'} p-4 rounded-lg space-y-6`}>
                        <div>
                          <p className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`}>
                            Email
                          </p>
                          <a href={`mailto:${selectedProfessor.email}`}
                             className={`text-sm ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`}>
                            {selectedProfessor.email}
                          </a>
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`}>
                            Research Subdomain
                          </p>
                          <p className={`text-sm ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>
                            {selectedProfessor.cs_subdomain}
                          </p>
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`}>
                            Preferred Majors
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProfessor.preferred_majors.length
                              ? selectedProfessor.preferred_majors.map((m, i) => (
                                  <span key={i}
                                        className={`px-3 py-1 rounded-full text-sm ${
                                          isDark
                                            ? 'bg-[#3a3a3a] text-[#d1cfbf]'
                                            : 'bg-[#f1f1f1] text-gray-700'
                                        }`}>
                                    {m}
                                  </span>
                                ))
                              : <span className="text-sm text-gray-500">None</span>}
                          </div>
                        </div>
                        {/* primary button */}
                        <button
                          onClick={
                            hasApplied && selectedProfessor.profile_link === selectedProfessor.profile_link
                              ? () => setActiveTab('editor')     // jump to editor
                              : () => handleComposeEmail(selectedProfessor)  // first‑time "Apply"
                          }
                          disabled={isApplying}
                          className={`w-full px-4 py-2 rounded-md ${
                            isDark ? 'bg-claude-orange text-[#1a1a1a]' : 'bg-claude-orange text-white'
                          }`}
                        >
                          {isApplying ? 'Generating...' : hasApplied && selectedProfessor.profile_link === selectedProfessor.profile_link ? 'Edit Email' : 'Generate Email'}
                        </button>

                        {/* always show mail app button once we have a draft */}
                        {draftEmail && selectedProfessor.profile_link === selectedProfessor.profile_link && (
                          <button
                            onClick={handleMailto}
                            className="w-full mt-2 px-4 py-2 rounded-md bg-claude-orange-dark text-white"
                          >
                            Send via Mail App
                          </button>
                        )}

                        {/* manual link fallback */}
                        {backupMailtoLink && draftEmail && selectedProfessor.profile_link === selectedProfessor.profile_link && (
                          <p className={`text-xs mt-2 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'}`}>
                            <a href={backupMailtoLink} target="_blank" rel="noopener noreferrer" className="underline">
                              Click to email manually
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`}>
                        Email Draft to {selectedProfessor.name}
                      </h3>
                      <textarea
                        className={`w-full h-[calc(100vh-300px)] p-3 rounded-md text-sm font-mono ${
                          isDark
                            ? 'bg-[#333333] text-[#d1cfbf] border border-gray-700'
                            : 'bg-white text-gray-900 border border-gray-300'
                        }`}
                        value={draftEmail}
                        onChange={(e) => setDraftEmail(e.target.value)}
                        placeholder="Loading email draft..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleMailto}
                          className={`px-4 py-2 rounded-md ${
                            isDark ? 'bg-claude-orange text-[#1a1a1a]' : 'bg-claude-orange text-white'
                          }`}
                        >
                          Send via Mail App
                        </button>
                        <button
                          onClick={() => setActiveTab('info')}
                          className={`px-4 py-2 rounded-md ${
                            isDark 
                              ? 'bg-[#333333] text-[#d1cfbf] hover:bg-[#444444]' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Back to Info
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`h-full flex items-center justify-center ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                <p className={`${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'}`}>
                  Select a professor from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 