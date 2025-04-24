import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../../lib/hooks/useTheme';
import { vastago } from '../../fonts';

interface ProfileCompletionFormProps {
  onSuccess?: () => void; // Optional callback for when the form is successfully submitted
}

const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({ onSuccess }) => {
  const { user } = useUser();
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!university.trim() || !major.trim()) {
      setError('University and Major are required fields');
      return;
    }

    if (!user) {
      setError('User not found.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Call your onboarding-completion API
      const resp = await fetch('/api/onboarding-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university,
          major,
          linkedin_url: linkedin,
          github_url: github,
          portfolio_url: portfolio,
          other_links: []  // or collect from additional inputs if you add them
        })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Onboarding API failed');
      }
      const profile = await resp.json() as {
        university: string;
        major: string;
        linkedin: string | null;
        portfolio: string | null;
        github: string | null;
        other_links: string[];
        summary_of_research_experience: string | null;
        research_interests: string[];
        skills: string[];
      };

      // 2. Upsert the returned ProfileResponse into Supabase
      const email = user.emailAddresses?.[0]?.emailAddress || '';
      const { error: sbError } = await supabase
        .from('profiles')
        .upsert({
          clerk_id:               user.id,
          email,
          university:            profile.university,
          major:                 profile.major,
          linkedin:          profile.linkedin,
          github:            profile.github,
          portfolio:         profile.portfolio,
          other_links:           profile.other_links,
          research_summary: profile.summary_of_research_experience,
          research_interests:    profile.research_interests,
          skills:                profile.skills,
          updated_at:            new Date()
        });

      if (sbError) throw sbError;

      onSuccess?.();
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-[#212121]' : 'bg-white'} max-w-xl mx-auto rounded-xl shadow-lg p-8 mt-8`}>
      <h1 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-alice`}>
        Complete Your Profile
      </h1>
      
      <p className={`text-sm mb-8 ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago`}>
        Tell us a bit about yourself so we can match you with personalized research opportunities. Fields marked with an asterisk (*) are required.
      </p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="university" 
            className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-1 font-vastago`}
          >
            University/College <span className="text-red-500">*</span>
          </label>
          <select
            id="university"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className={`w-full px-4 py-2 rounded-md ${
              isDark ? 'bg-[#2a2a2a] text-[#d1cfbf] border-[#3a3a3a]' : 'bg-white text-gray-900 border-gray-300'
            } border focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-[#d1cfbf]/50' : 'focus:ring-blue-500/50'
            } font-vastago`}
            required
          >
            <option value="">Select University</option>
            <option value="Purdue University">Purdue University</option>
          </select>
        </div>
        
        <div>
          <label 
            htmlFor="major" 
            className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-1 font-vastago`}
          >
            Major <span className="text-red-500">*</span>
          </label>
          <select
            id="major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className={`w-full px-4 py-2 rounded-md ${
              isDark ? 'bg-[#2a2a2a] text-[#d1cfbf] border-[#3a3a3a]' : 'bg-white text-gray-900 border-gray-300'
            } border focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-[#d1cfbf]/50' : 'focus:ring-blue-500/50'
            } font-vastago`}
            required
          >
            <option value="">Select Major</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Biology">Biology</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>
        
        <div>
          <label 
            htmlFor="portfolio" 
            className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-1 font-vastago`}
          >
            Portfolio URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            id="portfolio"
            className={`w-full px-4 py-2 rounded-md ${
              isDark ? 'bg-[#2a2a2a] text-[#d1cfbf] border-[#3a3a3a]' : 'bg-white text-gray-900 border-gray-300'
            } border focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-[#d1cfbf]/50' : 'focus:ring-blue-500/50'
            } font-vastago`}
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
          />
        </div>
        
        <div>
          <label 
            htmlFor="github" 
            className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-1 font-vastago`}
          >
            GitHub URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            id="github"
            className={`w-full px-4 py-2 rounded-md ${
              isDark ? 'bg-[#2a2a2a] text-[#d1cfbf] border-[#3a3a3a]' : 'bg-white text-gray-900 border-gray-300'
            } border focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-[#d1cfbf]/50' : 'focus:ring-blue-500/50'
            } font-vastago`}
            value={github}
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>

        <div>
          <label 
            htmlFor="linkedin" 
            className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} mb-1 font-vastago`}
          >
            Linkedin URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            id="linkedin"
            className={`w-full px-4 py-2 rounded-md ${
              isDark ? 'bg-[#2a2a2a] text-[#d1cfbf] border-[#3a3a3a]' : 'bg-white text-gray-900 border-gray-300'
            } border focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-[#d1cfbf]/50' : 'focus:ring-blue-500/50'
            } font-vastago`}
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${isDark 
              ? 'bg-[#d1cfbf] hover:bg-[#c1bfaf] text-[#1a1a1a]' 
              : 'bg-claude-orange hover:bg-claude-orange/90 text-white'
            } font-medium py-2.5 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark ? 'focus:ring-[#d1cfbf]' : 'focus:ring-claude-orange'
            } font-vastago`}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCompletionForm; 