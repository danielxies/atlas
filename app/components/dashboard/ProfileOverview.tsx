import React from 'react';

interface ProfileOverviewProps {
  isDark: boolean;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ isDark }) => {
  return (
    <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-lg shadow-md mb-6 p-6`}>
      <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>Profile Overview</h2>
      <p className={`mb-6 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'} font-vastago`}>
        Your Atlas profile is your hub for all of your research application needs!
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex items-start gap-3">
          <div className={`${isDark ? 'bg-claude-orange/30' : 'bg-claude-orange/10'} rounded-full p-2`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>Autofill Research Applications</h3>
            <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago`}>Your Atlas profile is used to autofill your research applications.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className={`${isDark ? 'bg-claude-orange/30' : 'bg-claude-orange/10'} rounded-full p-2`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>Tailored Research Materials</h3>
            <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago`}>Generate tailored resumes & cover letters using your profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview; 