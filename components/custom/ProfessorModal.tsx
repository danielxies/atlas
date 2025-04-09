import React from 'react';
import { Professor } from './ProfessorCard';
import { alice, vastago } from '@/app/fonts';

type ProfessorModalProps = {
  professor: Professor | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
  hasApplied: boolean;
  backupMailtoLink: string; // new prop for backup mailto link
  isDark?: boolean;
};

export default function ProfessorModal({ 
  professor, 
  isOpen, 
  onClose, 
  onApply, 
  isApplying, 
  hasApplied, 
  backupMailtoLink,
  isDark = false 
}: ProfessorModalProps) {
  if (!isOpen || !professor) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange'} mb-1 font-vastago`}>{professor.name}</h2>
              <p className={`text-sm ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>{professor.department}</p>
              <a
                href={professor.profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDark ? 'text-claude-orange hover:text-claude-orange/80' : 'text-claude-orange hover:text-claude-orange/80'} text-sm mt-1 inline-flex items-center gap-1 font-vastago`}
              >
                View Full Profile
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-[#d1cfbf]/60 hover:text-[#d1cfbf] hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} transition p-1 rounded-full`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange'} mb-2 font-vastago`}>Research Description</h3>
                <p className={`text-sm ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} leading-relaxed font-vastago`}>
                  {professor.research_description || 'No description available'}
                </p>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange'} mb-2 font-vastago`}>Research Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {professor.research_areas.map((area, index) => (
                    <span key={index} className={`${isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-claude-orange/10 text-claude-orange'} text-sm px-3 py-1 rounded-full font-vastago`}>
                      {area.replace(/[[\]']+/g, '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-[#222222]' : 'bg-gray-50'} p-4 rounded-lg space-y-6`}>
              <div>
                <div className="space-y-2">
                  <div>
                    <p className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange'} mb-3 font-vastago`}>Email</p>
                    <a href={`mailto:${professor.email}`} className={`text-sm ${isDark ? 'text-claude-orange hover:text-claude-orange/80' : 'text-claude-orange hover:text-claude-orange/80'} font-vastago`}>
                      {professor.email || 'Not provided'}
                    </a>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange'} mb-3 font-vastago`}>Research Subdomain</p>
                    <p className={`text-sm ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>
                      {professor.cs_subdomain || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange'} mb-3 font-vastago`}>Preferred Majors</h3>
                <div className="flex flex-wrap gap-2">
                  {professor.preferred_majors && professor.preferred_majors.length > 0 ? (
                    professor.preferred_majors.map((major, index) => (
                      <span key={index} className={`${isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-claude-orange/10 text-claude-orange'} px-3 py-1 rounded-full text-sm font-vastago`}>
                        {major.replace(/[[\]']+/g, '')}
                      </span>
                    ))
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>No preferred majors specified</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange'} mb-3 font-vastago`}>Looking For Researchers</h3>
                <p className={`text-sm ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>
                  {professor.currently_looking_for || 'Not specified'}
                </p>
              </div>
              <button
                onClick={onApply}
                disabled={isApplying || hasApplied}
                className={`w-full px-4 py-3 rounded-md font-medium transition ${
                  hasApplied 
                    ? 'bg-green-500 text-white' 
                    : isDark 
                      ? 'bg-claude-orange text-[#1a1a1a] hover:bg-claude-orange/90' 
                      : 'bg-claude-orange text-white hover:bg-claude-orange/90'
                } font-vastago`}
              >
                {isApplying ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Applying...</span>
                  </div>
                ) : hasApplied ? (
                  'Applied!'
                ) : (
                  'Apply Now'
                )}
              </button>
              {/* Backup mailto link block */}
              {backupMailtoLink && (
                <p className={`text-sm text-center ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-600'} mt-2 font-vastago`}>
                  Didn&apos;t see an email pop-up?
                  <br />
                  <a
                    href={backupMailtoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isDark ? 'text-claude-orange hover:text-claude-orange/80' : 'text-claude-orange hover:text-claude-orange/80'} font-medium underline`}
                  >
                    Click here to email manually
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
