'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/hooks/useTheme';
import { alice, vastago } from '../fonts';
import OpportunityModal, { ResearchOpportunity } from '@/components/custom/OpportunityModal';
import OpportunityCard from '@/components/custom/OpportunityCard';
import ProfessorCard, { Professor } from '@/components/custom/ProfessorCard';
import ProfessorModal from '@/components/custom/ProfessorModal';

function calculateSimilarity(searchText: string, professor: Professor): number {
  const searchLower = searchText.toLowerCase().trim();
  if (!searchLower) return 0;
  const searchTerms = searchLower.split(' ').filter(term => term.length >= 2);
  if (searchTerms.length === 0) return 0;
  let score = 0;
  for (const term of searchTerms) {
    if (professor.name.toLowerCase().includes(term)) score += 5;
    if (professor.department.toLowerCase().includes(term)) score += 4;
    if (professor.email.toLowerCase().includes(term)) score += 4;
    if (professor.research_areas.some(area => area.toLowerCase().includes(term))) score += 3;
    if (professor.preferred_majors.some(major => major.toLowerCase().includes(term))) score += 3;
    if (professor.research_description.toLowerCase().includes(term)) score += 2;
    if (professor.cs_subdomain.toLowerCase().includes(term)) score += 2;
    if (professor.currently_looking_for.toLowerCase().includes(term)) score += 1;
  }
  if (professor.name.toLowerCase() === searchLower) score += 3;
  if (professor.department.toLowerCase() === searchLower) score += 2;
  if (professor.email.toLowerCase() === searchLower) score += 2;
  if (professor.research_areas.some(area => area.toLowerCase() === searchLower)) score += 2;
  if (professor.preferred_majors.some(major => major.toLowerCase() === searchLower)) score += 2;
  console.log(`Professor: ${professor.name}, Score: ${score}`);
  return score;
}

export default function ResearchOpportunities() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { isDark, setIsDark } = useTheme();

  // State variables
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // New state variables for user profile additional fields
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
  // Added new fields for university and major
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');

  // New state for apply button
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  // New state for backup mailto link
  const [backupMailtoLink, setBackupMailtoLink] = useState('');

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

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

  // Filter professors based on search and department
  useEffect(() => {
    let filtered = [...professors];
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(
        prof =>
          prof.department.trim().toLowerCase() === selectedDepartment.trim().toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      filtered = filtered
        .map(prof => ({
          professor: prof,
          score: calculateSimilarity(searchQuery, prof),
        }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(result => result.professor);
    }
    const uniqueResults = Array.from(
      new Map(filtered.map(prof => [prof.profile_link, prof])).values()
    );
    setFilteredProfessors(uniqueResults);
  }, [professors, searchQuery, selectedDepartment]);

  // Handlers
  const handleSearch = (query: string) => setSearchQuery(query);
  const handleDepartmentChange = (department: string) => setSelectedDepartment(department);
  const openModal = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsModalOpen(true);
    // Reset apply states when opening a new modal
    setIsApplying(false);
    setHasApplied(false);
    // Reset backup mailto link when a new professor modal is opened
    setBackupMailtoLink('');
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProfessor(null);
  };

  const handleComposeEmail = async (professor: Professor) => {
    if (!user) return;
    setIsApplying(true);
    
    // Create a minimal professor object for email generation
    const nameParts = professor.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const professorEntry = `${firstName}|${lastName}|${professor.email}`;

    // Update the applied_professors column in the user's profile
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('applied_professors')
      .eq('clerk_id', user.id)
      .single();
    if (fetchError) {
      console.error('Error fetching applied_professors:', fetchError);
    } else {
      let appliedList = profileData.applied_professors || [];
      // If not an array, convert a comma-separated string to array
      if (!Array.isArray(appliedList)) {
        appliedList = appliedList.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }
      // Avoid duplicate entries
      if (!appliedList.includes(professorEntry)) {
        appliedList.push(professorEntry);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ applied_professors: appliedList })
          .eq('clerk_id', user.id);
        if (updateError) {
          console.error('Error updating applied_professors:', updateError);
        }
      }
    }

    // Gather user details including new fields for university and major
    const professorForEmail = {
      lastName: lastName,
      researchArea: professor.research_areas[0] || "the subject area",
      researchDescription: professor.research_description || "the research description"
    };
    const userDetails = {
      name: user.fullName || "Your Name",
      researchInterests: researchInterests,
      experience: researchSummary,
      skills: skills,
      resumeUrl: resumeUrl,
      linkedin: linkedin,
      github: github,
      otherLinks: otherLinks,
      university: university,
      major: major,
    };

    try {
      console.log(userDetails);
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professor: professorForEmail,
          user: userDetails,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Failed to generate email: ' + data.error);
        setIsApplying(false);
        return;
      }
      const emailOutput = data.email;
      console.log("Generated Email:", emailOutput);
      const lines = emailOutput.split('\n');
      let subject = '';
      let body = '';
      let subjectFound = false;
      for (const line of lines) {
        if (line.startsWith('Subject:')) {
          subject = line.replace('Subject:', '').trim();
          subjectFound = true;
        } else if (subjectFound) {
          body += line + '\n';
        }
      }
      const mailtoLink = `mailto:${professor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // Set the backup link
      setBackupMailtoLink(mailtoLink);
      // Open the mailto link as usual
      window.open(mailtoLink, '_blank');
      setIsApplying(false);
      setHasApplied(true);
    } catch (err) {
      console.error('Error in handleComposeEmail:', err);
      alert('An error occurred while generating your email.');
      setIsApplying(false);
    }
  };

  if (!isLoaded || !isSignedIn || isDataLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'}`}>
        Loading...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'} ${alice.variable} ${vastago.variable} flex flex-col`}>
      {/* Header */}
      <nav className={`w-full px-6 py-4 z-50 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'} shadow-sm`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image 
              src="/icon.png" 
              alt="Atlas Logo" 
              width={32} 
              height={32}
              onClick={() => router.push('/')} 
              className="cursor-pointer"
            />
            <span className={`font-vastago ${isDark ? 'text-[#d1cfbf]' : 'text-black'} text-xl font-semibold`}>Atlas</span>
          </div>

          {/* Right Side - Theme Toggle and links */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${isDark ? 'text-[#d1cfbf] hover:bg-white/10' : 'text-black hover:bg-black/10'} transition-colors`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/opportunities" className={`${isDark ? 'text-claude-orange' : 'text-claude-orange'} font-medium transition font-vastago px-3`}>
              Opportunities
            </Link>
            <Link href="/dashboard" className={`${isDark ? 'text-[#d1cfbf]' : 'text-black'} hover:text-claude-orange transition font-vastago px-3`}>
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-alice`}>Research Opportunities</h1>
          <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago`}>
            Discover and apply to exciting research projects across various disciplines
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 flex gap-4 items-start">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, research area, or department..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={`w-full px-4 py-2 border ${isDark ? 'border-gray-700 bg-[#2a2a2a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} rounded-lg focus:ring-2 focus:ring-claude-orange focus:border-transparent h-[42px]`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className={`h-5 w-5 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 h-[42px] ${
              isDark 
                ? (selectedDepartment !== 'all' ? 'bg-claude-orange text-[#1a1a1a]' : 'bg-[#3a3a3a] text-[#d1cfbf]') 
                : (selectedDepartment !== 'all' ? 'bg-claude-orange text-white' : 'bg-gray-200 text-gray-800')
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filters {selectedDepartment !== 'all' && '(1)'}
          </button>
        </div>

        {(searchQuery || selectedDepartment !== 'all') && (
          <p className={`mt-2 mb-6 text-sm ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-700'} font-vastago`}>
            Showing {filteredProfessors.length} unique results
          </p>
        )}

        {isDataLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-claude-orange' : 'border-blue-600'}`}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessors.map((professor) => (
              <ProfessorCard
                key={professor.profile_link}
                professor={professor}
                onClick={() => openModal(professor)}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </main>

      {/* Professor Modal with updated apply button props and backup mailto link */}
      <ProfessorModal
        professor={selectedProfessor}
        isOpen={isModalOpen}
        onClose={closeModal}
        onApply={() => selectedProfessor && handleComposeEmail(selectedProfessor)}
        isApplying={isApplying}
        hasApplied={hasApplied}
        backupMailtoLink={backupMailtoLink}
        isDark={isDark}
      />

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className={`${isDark ? 'bg-[#2a2a2a] text-[#d1cfbf]' : 'bg-white text-gray-800'} rounded-lg shadow-xl p-6 w-full max-w-md`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-alice`}>
                Filter Options
              </h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Department Filter */}
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'} mb-1`}>
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className={`w-full p-2 rounded-md border ${
                    isDark ? 'bg-[#333] border-gray-700 text-[#d1cfbf]' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-claude-orange focus:border-transparent`}
                >
                  <option value="all">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              {/* Subject/Research Area Tags (for future implementation) */}
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'} mb-1`}>
                  Research Areas
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    'Machine Learning', 
                    'AI', 
                    'Data Science', 
                    'Bioinformatics',
                    'Quantum Computing'
                  ].map(area => (
                    <button 
                      key={area}
                      // onClick to be implemented for multiple filter selection
                      className={`px-3 py-1 text-sm rounded-full border ${
                        isDark 
                          ? 'border-gray-700 bg-[#333] text-[#d1cfbf] hover:bg-[#444]' 
                          : 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Looking For (Student Level) */}
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'} mb-1`}>
                  Looking For
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    'Undergrad', 
                    'Masters', 
                    'PhD',
                    'Post-doc'
                  ].map(level => (
                    <button 
                      key={level}
                      // onClick to be implemented for multiple filter selection
                      className={`px-3 py-1 text-sm rounded-full border ${
                        isDark 
                          ? 'border-gray-700 bg-[#333] text-[#d1cfbf] hover:bg-[#444]' 
                          : 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleDepartmentChange('all');
                    setShowFilterModal(false);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    isDark 
                      ? 'bg-[#3a3a3a] text-[#d1cfbf] hover:bg-[#444]' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    isDark 
                      ? 'bg-claude-orange text-[#1a1a1a]' 
                      : 'bg-claude-orange text-white'
                  } hover:opacity-90`}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
