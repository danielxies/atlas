'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../lib/hooks/useTheme';
import { alice, vastago } from '../fonts';
import { Pencil } from 'lucide-react';

// Import components
import ProfileHeader from '../components/dashboard/ProfileHeader';
import ProfileStrength from '../components/dashboard/ProfileStrength';
import ProfileCard from '../components/dashboard/ProfileCard';
import EditProfileForm from '../components/dashboard/EditProfileForm';
import ModalComponent from '../components/dashboard/ModalComponent';
import Footer from '../components/shared/Footer';
import Navbar from '../components/shared/Navbar';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { isDark, setIsDark } = useTheme();

  // Redirect to login if not authenticated once auth is loaded
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  // New effect to check if profile is complete and redirect if not
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

  // Profile state variables
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [github, setGithub] = useState('');
  const [otherLinks, setOtherLinks] = useState<string[]>([]);
  const [researchSummary, setResearchSummary] = useState('');
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // New state variables for university and major
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');

  // New state for profile strength
  const [profileStrength, setProfileStrength] = useState(0);

  // State for work experience and education (left for future integration)
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Calculate profile strength
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    let strength = 0;
    let totalFields = 6; // Base fields we're checking
    
    // Check each field and increment strength if provided
    if (resumeUrl) strength++;
    if (university) strength++;
    if (major) strength++;
    if (linkedin || portfolio || github || otherLinks.length > 0) strength++;
    if (researchSummary) strength++;
    if (researchInterests.length > 0 || skills.length > 0) strength++;
    
    // Set as percentage
    setProfileStrength(Math.round((strength / totalFields) * 100));
  }, [resumeUrl, university, major, linkedin, portfolio, github, otherLinks, researchSummary, researchInterests, skills, isLoaded, isSignedIn]);

  // Fetch profile data from Supabase if available
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setLinkedin(data.linkedin || '');
        setPortfolio(data.portfolio || '');
        setGithub(data.github || '');
        setOtherLinks(data.other_links || []);
        setResearchSummary(data.research_summary || '');
        setResearchInterests(data.research_interests || []);
        setSkills(data.skills || []);
        setResumeUrl(data.resume || '');
        setSubscribed(data.subscribed || false);
        // Set the new fields
        setUniversity(data.university || '');
        setMajor(data.major || '');
      }
      setLoading(false);
    }
    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn, user]);

  // Simplified version - we'll keep the placeholders for experience and education
  useEffect(() => {
    async function fetchExperienceAndEducation() {
      if (!user) return;
      // In the future, these can be fetched from the database
      setWorkExperiences([]);
      setEducations([]);
    }
    
    if (isLoaded && isSignedIn) {
      fetchExperienceAndEducation();
    }
  }, [isLoaded, isSignedIn, user]);

  // Handle profile updates with file upload and email inclusion
  const handleUpdateProfile = async () => {
    if (!user) return;
    let uploadedResumeUrl = resumeUrl;

    if (resumeFile) {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      // Attempt to upload the file to the "profiles" bucket
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, resumeFile, { upsert: false });
      if (uploadError) {
        console.error('Error uploading resume:', uploadError);
        setModalMessage('Failed to upload resume: ' + uploadError.message);
        setShowModal(true);
        return;
      }

      // Retrieve the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        console.error('Failed to get resume URL');
        setModalMessage('Failed to get resume URL');
        setShowModal(true);
        return;
      }
      uploadedResumeUrl = publicUrlData.publicUrl;
      setResumeUrl(uploadedResumeUrl);

      console.log('parsing resume');
      const response = await fetch('/api/parseresume', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: uploadedResumeUrl,
          clerk_id: user.id,
        }),
      });
      console.log('post parsing');
      const result = await response.json();
      if (!response.ok) {
        console.error('Error parsing resume:', result.error);
        setModalMessage('Failed to parse resume: ' + result.error);
        setShowModal(true);
        return;
      } else {
        console.log('Successfully parsed')
      }
    }

    // Retrieve the user's email from Clerk (first email is primary)
    const email = user.emailAddresses?.[0]?.emailAddress || '';

    // Upsert the profile data into Supabase, including the email, subscription status, and new fields
    const { error } = await supabase.from('profiles').upsert({
      clerk_id: user.id,
      email,
      linkedin,
      portfolio,
      github,
      other_links: otherLinks,
      research_summary: researchSummary,
      research_interests: researchInterests,
      skills,
      resume: uploadedResumeUrl,
      subscribed,
      university,
      major,
    });

    if (error) {
      console.error('Error updating profile:', error);
      setModalMessage('Failed to update profile: ' + error.message);
      setShowModal(true);
    } else {
      setModalMessage('Profile updated successfully!');
      setShowModal(true);
      setEditMode(false);
    }
  };

  if (loading || !isLoaded || !isSignedIn) {
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
                    animationDuration: '1.2s'
                  }}
                ></div>
              ))}
            </div>
          </div>
          <p className={`text-xl ${vastago.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} opacity-0 animate-fadeIn`}
             style={{ animationDelay: '0.3s', animationDuration: '0.8s', animationFillMode: 'forwards' }}>
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'} ${alice.variable} ${vastago.variable} flex flex-col`}>
      {/* Header */}
      <Navbar isDark={isDark} setIsDark={setIsDark} />

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-alice`}>My Profile</h1>
          <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago`}>Manage your profile information to improve your research applications.</p>
        </div>
        
        {/* Profile Content */}
        {editMode ? (
          // Edit Mode
          <EditProfileForm 
            isDark={isDark}
            user={user}
            resumeUrl={resumeUrl}
            university={university}
            major={major}
            linkedin={linkedin}
            portfolio={portfolio}
            github={github}
            otherLinks={otherLinks}
            researchSummary={researchSummary}
            researchInterests={researchInterests}
            skills={skills}
            subscribed={subscribed}
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            setUniversity={setUniversity}
            setMajor={setMajor}
            setLinkedin={setLinkedin}
            setPortfolio={setPortfolio}
            setGithub={setGithub}
            setOtherLinks={setOtherLinks}
            setResearchSummary={setResearchSummary}
            setResearchInterests={setResearchInterests}
            setSkills={setSkills}
            setSubscribed={setSubscribed}
            handleUpdateProfile={handleUpdateProfile}
            onCancel={() => setEditMode(false)}
          />
        ) : (
          // Display Mode
          <div className="space-y-6">
            <ProfileCard 
              isDark={isDark}
              user={user}
              resumeUrl={resumeUrl}
              university={university}
              major={major}
              linkedin={linkedin}
              portfolio={portfolio}
              github={github}
              otherLinks={otherLinks}
              researchSummary={researchSummary}
              researchInterests={researchInterests}
              skills={skills}
              subscribed={subscribed}
              editMode={editMode}
              setEditMode={setEditMode}
            />
            
            {/* Profile Strength moved to horizontal position below profile card */}
            <ProfileStrength isDark={isDark} profileStrength={profileStrength} />
          </div>
        )}
      </main>
      
      {/* Modal for success/error messages */}
      <ModalComponent 
        isDark={isDark} 
        showModal={showModal} 
        setShowModal={setShowModal} 
        modalMessage={modalMessage} 
      />
      
      {/* Footer */}
      <Footer isDark={isDark} />
    </div>
  );
}
