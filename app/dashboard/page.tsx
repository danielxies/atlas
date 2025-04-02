'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Redirect to login if not authenticated once auth is loaded
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  // Profile state variables
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [github, setGithub] = useState('');
  const [otherLinks, setOtherLinks] = useState<string[]>([]);
  const [newOtherLink, setNewOtherLink] = useState('');
  const [researchSummary, setResearchSummary] = useState('');
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

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
      }
      setLoading(false);
    }
    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn, user]);

  // Handle resume file selection
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

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
        alert('Failed to upload resume: ' + uploadError.message);
        return;
      }

      // Retrieve the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        console.error('Failed to get resume URL');
        alert('Failed to get resume URL');
        return;
      }
      uploadedResumeUrl = publicUrlData.publicUrl;
      setResumeUrl(uploadedResumeUrl);
    }

    // Retrieve the user's email from Clerk (first email is primary)
    const email = user.emailAddresses?.[0]?.emailAddress || '';

    // Upsert the profile data into Supabase, including the email and subscription status
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
      subscribed, // New subscription boolean
    });

    if (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } else {
      alert('Profile updated successfully!');
      setEditMode(false);
    }
  };

  // Dynamic array handlers
  const addOtherLink = () => {
    if (newOtherLink.trim() && otherLinks.length < 5) {
      setOtherLinks([...otherLinks, newOtherLink.trim()]);
      setNewOtherLink('');
    }
  };

  const removeOtherLink = (index: number) => {
    const newLinks = [...otherLinks];
    newLinks.splice(index, 1);
    setOtherLinks(newLinks);
  };

  const addInterest = () => {
    if (newInterest.trim() && researchInterests.length < 10) {
      setResearchInterests([...researchInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    const newInterests = [...researchInterests];
    newInterests.splice(index, 1);
    setResearchInterests(newInterests);
  };

  const addSkill = () => {
    if (newSkill.trim() && skills.length < 10) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setSkills(newSkills);
  };

  if (loading || !isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image 
              src="/icon.png" 
              alt="Research Hub Logo" 
              width={36} 
              height={36} 
              className="cursor-pointer" 
              onClick={() => router.push('/')}
            />
            <h2 className="text-xl font-bold text-blue-800">ResearchConnect</h2>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/opportunities" className="text-gray-700 hover:text-blue-600 transition">
              Opportunities
            </Link>
            <Link href="/dashboard" className="text-blue-600 font-medium transition">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your profile information below.</p>
        </div>

        {/* Edit/Cancel Toggle */}
        <div className="mb-4">
          {editMode ? (
            <button 
              className="text-red-600 hover:text-red-800 text-sm font-semibold"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          ) : (
            <button 
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
          )}
        </div>

        {/* Display Email (Read-only) */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">Email:</label>
          <p className="text-black">{user.emailAddresses?.[0]?.emailAddress || 'Not provided'}</p>
        </div>

        {/* Profile Blocks */}
        {editMode ? (
          // Edit Mode: Input fields for editing
          <div className="space-y-6">
            {/* Resume Upload with Modern Button */}
            <div>
              <label className="block font-semibold mb-1">Resume (PDF):</label>
              <label className="cursor-pointer inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V2m0 0L8 6m4-4l4 4"
                  />
                </svg>
                <span className="ml-2">Choose File</span>
                <input type="file" accept=".pdf" onChange={handleResumeChange} className="hidden" />
              </label>
              {resumeFile && <p className="mt-2 text-sm text-gray-700">{resumeFile.name}</p>}
            </div>

            {/* LinkedIn, Portfolio, GitHub */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">LinkedIn URL:</label>
                <input 
                  type="url" 
                  value={linkedin} 
                  onChange={(e) => setLinkedin(e.target.value)} 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Portfolio URL:</label>
                <input 
                  type="url" 
                  value={portfolio} 
                  onChange={(e) => setPortfolio(e.target.value)} 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">GitHub URL:</label>
                <input 
                  type="url" 
                  value={github} 
                  onChange={(e) => setGithub(e.target.value)} 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>

            {/* Other Links */}
            <div>
              <label className="block font-semibold mb-1">Other Links (max 5):</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Enter URL"
                  value={newOtherLink}
                  onChange={(e) => setNewOtherLink(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addOtherLink(); }}
                  className="border border-gray-300 rounded-lg p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addOtherLink} className="bg-blue-600 text-white px-3 py-2 rounded-lg">
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {otherLinks.map((link, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                    <span>{link}</span>
                    <button onClick={() => removeOtherLink(index)} className="ml-2 text-red-500">&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Summary */}
            <div>
              <label className="block font-semibold mb-1">Summary of Research Experience (max 150 words):</label>
              <textarea
                value={researchSummary}
                onChange={(e) => {
                  const words = e.target.value.split(/\s+/);
                  if (words.length <= 150) setResearchSummary(e.target.value);
                }}
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
              />
            </div>

            {/* Research Interests */}
            <div>
              <label className="block font-semibold mb-1">Research Interests/Domains (max 10):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter interest"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addInterest(); }}
                  className="border border-gray-300 rounded-lg p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addInterest} className="bg-blue-600 text-white px-3 py-2 rounded-lg">
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {researchInterests.map((interest, index) => (
                  <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                    <span>{interest}</span>
                    <button onClick={() => removeInterest(index)} className="ml-2 text-red-500">&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block font-semibold mb-1">Skills (max 10):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
                  className="border border-gray-300 rounded-lg p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addSkill} className="bg-blue-600 text-white px-3 py-2 rounded-lg">
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center">
                    <span>{skill}</span>
                    <button onClick={() => removeSkill(index)} className="ml-2 text-red-500">&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscribed Checkbox */}
            <div className="flex items-center">
              <input 
                type="checkbox"
                id="subscribe"
                checked={subscribed}
                onChange={(e) => setSubscribed(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="subscribe" className="font-semibold">
                Subscribed to Research Updates
              </label>
            </div>

            <div className="mt-6">
              <button
                onClick={handleUpdateProfile}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Profile
              </button>
            </div>
          </div>
        ) : (
          // Display Mode: Read-only view
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-1">Email:</label>
              <p className="text-black">{user.emailAddresses?.[0]?.emailAddress || 'Not provided'}</p>
            </div>
            <div>
              <label className="block font-semibold mb-1">Resume:</label>
              {resumeUrl ? (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View Resume
                </a>
              ) : (
                <p>Not provided</p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">LinkedIn URL:</label>
              <p>{linkedin || 'Not provided'}</p>
            </div>
            <div>
              <label className="block font-semibold mb-1">Portfolio URL:</label>
              <p>{portfolio || 'Not provided'}</p>
            </div>
            <div>
              <label className="block font-semibold mb-1">GitHub URL:</label>
              <p>{github || 'Not provided'}</p>
            </div>
            <div>
              <label className="block font-semibold mb-1">Other Links:</label>
              {otherLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {otherLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              ) : (
                <p>Not provided</p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Summary of Research Experience:</label>
              <p>{researchSummary || 'Not provided'}</p>
            </div>
            <div>
              <label className="block font-semibold mb-1">Research Interests/Domains:</label>
              {researchInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {researchInterests.map((interest, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p>Not provided</p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Skills:</label>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p>Not provided</p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Subscribed to Research Updates:</label>
              <p>{subscribed ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
