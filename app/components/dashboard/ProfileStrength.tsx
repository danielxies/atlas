import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Circle } from 'lucide-react';

interface ProfileStrengthProps {
  isDark: boolean;
  profileStrength: number;
}

type ProfileItem = {
  id: string;
  label: string;
  percentage: number;
  completed: boolean;
};

const ProfileStrength: React.FC<ProfileStrengthProps> = ({ isDark, profileStrength }) => {
  const [expanded, setExpanded] = useState(true);
  
  // These items would ideally come from props, but for now we'll hardcode them
  const profileItems: ProfileItem[] = [
    { id: 'contact', label: 'Add your contact info', percentage: 10, completed: true },
    { id: 'education', label: 'Add your education journey', percentage: 15, completed: true },
    { id: 'experience', label: 'Add your work experience', percentage: 25, completed: true },
    { id: 'resume', label: 'Add your resume', percentage: 15, completed: true },
    { id: 'links', label: 'Add your personal links', percentage: 15, completed: true },
    { id: 'skills', label: 'Add your skills', percentage: 10, completed: true },
    { id: 'employment', label: 'Fill out your employment info', percentage: 10, completed: true }
  ];
  
  return (
    <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-lg shadow-md mb-6 p-6`}>
      <div className="mb-4">
        <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago mb-1`}>
          Complete your profile to increase visibility and get better research matches.
        </p>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-fit">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>Profile Strength</h2>
              <span className={`font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>{profileStrength}%</span>
            </div>
            <button 
              onClick={() => setExpanded(!expanded)}
              className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              {expanded ? 
                <ChevronUp size={18} className={isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} /> : 
                <ChevronDown size={18} className={isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} />
              }
            </button>
          </div>
          <div className={`w-full h-2 ${isDark ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${isDark ? 'bg-claude-orange' : 'bg-claude-orange'} rounded-full`}
              style={{ width: `${profileStrength}%` }}
            ></div>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 space-y-2">
            {profileItems.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                {item.completed ? (
                  <div className={`rounded-full p-1 ${isDark ? 'bg-claude-orange/20 text-claude-orange' : 'bg-claude-orange/20 text-claude-orange'}`}>
                    <Check size={16} />
                  </div>
                ) : (
                  <div className={`rounded-full p-1 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-400'}`}>
                    <Circle size={16} />
                  </div>
                )}
                <span className={`flex-grow font-vastago ${item.completed ? 
                  (isDark ? 'text-[#d1cfbf]/60 line-through' : 'text-gray-500 line-through') : 
                  (isDark ? 'text-[#d1cfbf]' : 'text-gray-900')}`}>
                  {item.label}
                </span>
                <span className={`font-vastago ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'}`}>
                  {item.completed ? '' : `+${item.percentage}%`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileStrength; 