import React, { useState } from 'react';
import Link from 'next/link';
import { Pencil, FileText } from 'lucide-react';

interface ProfileCardProps {
  isDark: boolean;
  user: any;
  resumeUrl: string;
  university: string;
  major: string;
  linkedin: string;
  portfolio: string;
  github: string;
  otherLinks: string[];
  researchSummary: string;
  researchInterests: string[];
  skills: string[];
  subscribed: boolean;
  editMode?: boolean;
  setEditMode?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  isDark,
  user,
  resumeUrl,
  university,
  major,
  linkedin,
  portfolio,
  github,
  otherLinks,
  researchSummary,
  researchInterests,
  skills,
  subscribed,
  editMode,
  setEditMode,
}) => {
  const [showResearchModal, setShowResearchModal] = useState(false);

  const renderLink = (url: string, label?: string) => {
    if (!url) return null;
    
    // Check if the URL has a protocol, if not add https://
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    return (
      <a 
        href={formattedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${isDark ? 'text-claude-orange' : 'text-claude-orange'} hover:underline font-vastago`}
      >
        {label || url}
      </a>
    );
  };

  // Function to validate and format LinkedIn URL
  const formatLinkedInUrl = (url: string) => {
    if (!url) return '';
    
    // Ensure URL has proper format for LinkedIn
    let formattedUrl = url;
    if (!url.startsWith('http')) {
      formattedUrl = `https://${url}`;
    }
    
    // Check if it contains linkedin.com
    if (!formattedUrl.includes('linkedin.com/in/')) {
      if (formattedUrl.includes('linkedin.com')) {
        // Just missing the /in/ part
        formattedUrl = formattedUrl.replace('linkedin.com', 'linkedin.com/in');
      } else {
        // Assume it's just the username
        formattedUrl = `https://www.linkedin.com/in/${formattedUrl.replace(/^https?:\/\//, '')}`;
      }
    }
    
    return formattedUrl;
  };

  // Function to validate and format GitHub URL
  const formatGitHubUrl = (url: string) => {
    if (!url) return '';
    
    // Ensure URL has proper format for GitHub
    let formattedUrl = url;
    if (!url.startsWith('http')) {
      formattedUrl = `https://${url}`;
    }
    
    // Check if it contains github.com
    if (!formattedUrl.includes('github.com/')) {
      // Assume it's just the username
      formattedUrl = `https://github.com/${formattedUrl.replace(/^https?:\/\//, '')}`;
    }
    
    return formattedUrl;
  };

  return (
    <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        {/* Left column - Basic info */}
        <div className="w-full md:w-1/3">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-claude-orange/20' : 'bg-claude-orange/10'} text-2xl font-semibold ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>
                  {user.firstName} {user.lastName}
                </h3>
                <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago`}>
                  {university && major ? `${major} at ${university}` : 'Researcher'}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>Email</p>
                <p className={`${isDark ? 'text-[#d1cfbf]' : 'text-black'} font-vastago truncate`}>
                  {user.emailAddresses?.[0]?.emailAddress || 'Not provided'}
                </p>
              </div>
              
              {university && (
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>University</p>
                  <p className={`${isDark ? 'text-[#d1cfbf]' : 'text-black'} font-vastago`}>{university}</p>
                </div>
              )}
              
              {major && (
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>Major</p>
                  <p className={`${isDark ? 'text-[#d1cfbf]' : 'text-black'} font-vastago`}>{major}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Links and details */}
        <div className="w-full md:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Documents */}
            <div>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>Documents</h4>
              <div className="space-y-2">
                {resumeUrl ? (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {renderLink(resumeUrl, 'Resume')}
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>No resume uploaded</p>
                )}
                
                {researchSummary && (
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} />
                    <button 
                      onClick={() => setShowResearchModal(true)}
                      className={`${isDark ? 'text-claude-orange hover:text-claude-orange/80' : 'text-claude-orange hover:text-claude-orange/80'} font-vastago hover:underline`}
                    >
                      Research Summary
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Online Profiles */}
            <div>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>Online Profiles</h4>
              <div className="space-y-2">
                {linkedin && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <a 
                      href={formatLinkedInUrl(linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${isDark ? 'text-claude-orange' : 'text-claude-orange'} hover:underline font-vastago`}
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                
                {github && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                    </svg>
                    <a 
                      href={formatGitHubUrl(github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${isDark ? 'text-claude-orange' : 'text-claude-orange'} hover:underline font-vastago`}
                    >
                      GitHub
                    </a>
                  </div>
                )}
                
                {portfolio && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {renderLink(portfolio, 'Portfolio')}
                  </div>
                )}
                
                {otherLinks.length > 0 && otherLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {renderLink(link)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Research Interests and Skills */}
          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {researchInterests.length > 0 && (
                <div>
                  <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>Research Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {researchInterests.map((interest, idx) => (
                      <span key={idx} className={`${isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-green-100 text-green-800'} px-2 py-1 rounded-full text-xs font-vastago`}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {skills.length > 0 && (
                <div>
                  <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span key={idx} className={`${isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded-full text-xs font-vastago`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Button at the bottom */}
      {setEditMode && (
        <div className="mt-6 flex justify-center">
          <button 
            className={`${isDark ? 'bg-claude-orange/80 text-[#1a1a1a]' : 'bg-claude-orange text-white'} text-base font-medium px-5 py-2 rounded-lg ${isDark ? 'hover:bg-claude-orange' : 'hover:bg-claude-orange/90'} transition w-full md:w-1/3 flex items-center justify-center gap-2`}
            onClick={() => setEditMode(true)}
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        </div>
      )}

      {/* Research Summary Modal */}
      {showResearchModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowResearchModal(false)}
        >
          <div 
            className={`${isDark ? 'bg-[#2a2a2a] text-[#d1cfbf]' : 'bg-white text-black'} w-full max-w-3xl rounded-lg p-8 max-h-[80vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className={`text-2xl font-semibold ${isDark ? 'text-claude-orange' : 'text-claude-orange'} font-vastago`}>Research Summary</h3>
              <button 
                onClick={() => setShowResearchModal(false)}
                className={`p-1 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="font-vastago whitespace-pre-line text-base leading-relaxed">{researchSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard; 