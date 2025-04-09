import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

interface EditProfileFormProps {
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
  resumeFile: File | null;
  
  // Methods
  setResumeFile: (file: File | null) => void;
  setUniversity: (value: string) => void;
  setMajor: (value: string) => void;
  setLinkedin: (value: string) => void;
  setPortfolio: (value: string) => void;
  setGithub: (value: string) => void;
  setOtherLinks: (links: string[]) => void;
  setResearchSummary: (value: string) => void;
  setResearchInterests: (interests: string[]) => void;
  setSkills: (skills: string[]) => void;
  setSubscribed: (value: boolean) => void;
  handleUpdateProfile: () => Promise<void>;
  onCancel?: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
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
  resumeFile,
  setResumeFile,
  setUniversity,
  setMajor,
  setLinkedin,
  setPortfolio,
  setGithub,
  setOtherLinks,
  setResearchSummary,
  setResearchInterests,
  setSkills,
  setSubscribed,
  handleUpdateProfile,
  onCancel,
}) => {
  // Local state for form inputs
  const [newOtherLink, setNewOtherLink] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');

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

  // Handle resume file selection
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Resume Upload with Modern Button */}
      <div>
        <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>Resume (PDF):</label>
        <label className={`cursor-pointer inline-flex items-center ${isDark ? 'bg-claude-orange/80 text-[#1a1a1a]' : 'bg-claude-orange text-white'} px-4 py-2 rounded-lg ${isDark ? 'hover:bg-claude-orange' : 'hover:bg-claude-orange/90'} transition`}>
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
        {resumeFile && <p className={`mt-2 text-sm ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-700'} font-vastago`}>{resumeFile.name}</p>}
      </div>

      {/* Basic Info: University and Major */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>University:</label>
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`}
          >
            <option value="">Select University</option>
            <option value="Purdue University">Purdue University</option>
          </select>
        </div>
        <div>
          <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>Major:</label>
          <select
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`}
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
      </div>

      {/* URLs: LinkedIn, Portfolio, GitHub - Now on separate lines */}
      <div className="space-y-4">
        <div>
          <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>LinkedIn URL:</label>
          <input 
            type="url" 
            value={linkedin} 
            onChange={(e) => setLinkedin(e.target.value)} 
            className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`} 
          />
        </div>
        <div>
          <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>Portfolio URL:</label>
          <input 
            type="url" 
            value={portfolio} 
            onChange={(e) => setPortfolio(e.target.value)} 
            className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`} 
          />
        </div>
        <div>
          <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>GitHub URL:</label>
          <input 
            type="url" 
            value={github} 
            onChange={(e) => setGithub(e.target.value)} 
            className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`} 
          />
        </div>
      </div>

      {/* Other Links */}
      <div>
        <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>Other Links (max 5):</label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Enter URL"
            value={newOtherLink}
            onChange={(e) => setNewOtherLink(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addOtherLink(); }}
            className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 flex-grow focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`}
          />
          <button onClick={addOtherLink} className={`${isDark ? 'bg-claude-orange/80 text-[#1a1a1a]' : 'bg-claude-orange text-white'} px-3 py-2 rounded-lg ${isDark ? 'hover:bg-claude-orange' : 'hover:bg-claude-orange/90'}`}>
            <PlusCircle size={20} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {otherLinks.map((link, index) => (
            <div key={index} className={`${isDark ? 'bg-[#2a2a2a] text-[#d1cfbf]' : 'bg-blue-100 text-blue-800'} px-3 py-1 rounded-full flex items-center`}>
              <span>{link}</span>
              <button onClick={() => removeOtherLink(index)} className={`ml-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Research Summary */}
      <div>
        <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>Summary of Research Experience (max 150 words):</label>
        <textarea
          value={researchSummary}
          onChange={(e) => {
            const words = e.target.value.split(/\s+/);
            if (words.length <= 150) setResearchSummary(e.target.value);
          }}
          className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`}
          rows={5}
        />
      </div>

      {/* Research Interests */}
      <div>
        <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>Research Interests/Domains (max 10):</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter interest"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addInterest(); }}
            className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 flex-grow focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`}
          />
          <button onClick={addInterest} className={`${isDark ? 'bg-claude-orange/80 text-[#1a1a1a]' : 'bg-claude-orange text-white'} px-3 py-2 rounded-lg ${isDark ? 'hover:bg-claude-orange' : 'hover:bg-claude-orange/90'}`}>
            <PlusCircle size={20} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {researchInterests.map((interest, index) => (
            <div key={index} className={`${isDark ? 'bg-[#2a2a2a] text-[#d1cfbf]' : 'bg-green-100 text-green-800'} px-3 py-1 rounded-full flex items-center`}>
              <span>{interest}</span>
              <button onClick={() => removeInterest(index)} className={`ml-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className={`block font-semibold mb-1 ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>Skills (max 10):</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
            className={`${isDark ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} border rounded-lg p-2 flex-grow focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-claude-orange/50' : 'focus:ring-claude-orange'}`}
          />
          <button onClick={addSkill} className={`${isDark ? 'bg-claude-orange/80 text-[#1a1a1a]' : 'bg-claude-orange text-white'} px-3 py-2 rounded-lg ${isDark ? 'hover:bg-claude-orange' : 'hover:bg-claude-orange/90'}`}>
            <PlusCircle size={20} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div key={index} className={`${isDark ? 'bg-[#2a2a2a] text-[#d1cfbf]' : 'bg-purple-100 text-purple-800'} px-3 py-1 rounded-full flex items-center`}>
              <span>{skill}</span>
              <button onClick={() => removeSkill(index)} className={`ml-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                <Trash2 size={14} />
              </button>
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
        <label htmlFor="subscribe" className={`font-semibold ${isDark ? 'text-[#d1cfbf]' : ''} font-vastago`}>
          Subscribed to Research Updates
        </label>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleUpdateProfile}
          className={`${isDark ? 'bg-claude-orange/80 text-[#1a1a1a]' : 'bg-claude-orange text-white'} px-4 py-2 rounded-lg ${isDark ? 'hover:bg-claude-orange' : 'hover:bg-claude-orange/90'} transition`}
        >
          Save Profile
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className={`${isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-gray-200 text-gray-800'} px-4 py-2 rounded-lg hover:bg-opacity-80 transition`}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default EditProfileForm; 