// components/custom/TabbedApplyModal.tsx
import React, { useState, useEffect } from 'react';
import EmailEditor from './EmailEditor';
import { Professor } from './ProfessorCard';

type TabbedApplyModalProps = {
  professor: Professor;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
  hasApplied: boolean;
  backupMailtoLink: string;
  draftEmail: string;
  setDraftEmail: (text: string) => void;
  handleMailto: () => void;
  isDark?: boolean;
};

export default function TabbedApplyModal({
  professor,
  isOpen,
  onClose,
  onApply,
  isApplying,
  hasApplied,
  backupMailtoLink,
  draftEmail,
  setDraftEmail,
  handleMailto,
  isDark = false,
}: TabbedApplyModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'editor'>(hasApplied ? 'editor' : 'info');

  // Add effect to prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Prevent scrolling on the background
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Cleanup function to restore scrolling when modal closes
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (hasApplied) setActiveTab('editor');
  }, [hasApplied]);

  if (!isOpen) return null;

  const tabClass = (tab: 'info' | 'editor') =>
    `px-4 py-2 font-vastago ${
      activeTab === tab
        ? isDark
          ? 'border-b-2 border-claude-orange text-[#d1cfbf]'
          : 'border-b-2 border-claude-orange-dark text-gray-900'
        : 'text-gray-500'
    }`;

  // Add onClick handler to prevent event propagation for modal content
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
        onClick={handleModalContentClick}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'} font-vastago`}>
            {professor.name}
          </h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg"
                 className="h-6 w-6"
                 fill="none"
                 viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button className={tabClass('info')} onClick={() => setActiveTab('info')}>
            Professor Info
          </button>
          <button className={tabClass('editor')} onClick={() => setActiveTab('editor')}>
            Email Editor
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'info' ? (
            <div className="grid md:grid-cols-3 gap-8">
              {/* LEFT COLUMN */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'} font-vastago`}>
                    Research Description
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>
                    {professor.research_description}
                  </p>
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'} font-vastago`}>
                    Research Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {professor.research_areas.map((area, i) => (
                      <span key={i}
                            className={`px-3 py-1 rounded-full text-sm font-vastago ${
                              isDark
                                ? 'bg-[#3a3a3a] text-[#d1cfbf]'
                                : 'bg-claude-orange/10 text-claude-orange-dark'
                            }`}>
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className={`${isDark ? 'bg-[#222222]' : 'bg-gray-50'} p-4 rounded-lg space-y-6`}>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'} font-vastago`}>
                    Email
                  </p>
                  <a href={`mailto:${professor.email}`}
                     className={`text-sm ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'} font-vastago`}>
                    {professor.email}
                  </a>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'} font-vastago`}>
                    Research Subdomain
                  </p>
                  <p className={`text-sm ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-vastago`}>
                    {professor.cs_subdomain}
                  </p>
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'} font-vastago`}>
                    Preferred Majors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {professor.preferred_majors.length
                      ? professor.preferred_majors.map((m, i) => (
                          <span key={i}
                                className={`px-3 py-1 rounded-full text-sm font-vastago ${
                                  isDark
                                    ? 'bg-[#3a3a3a] text-[#d1cfbf]'
                                    : 'bg-claude-orange/10 text-claude-orange-dark'
                                }`}>
                            {m}
                          </span>
                        ))
                      : <span className="text-sm text-gray-500 font-vastago">None</span>}
                  </div>
                </div>
                {/* primary button */}
                <button
                  onClick={
                    hasApplied
                      ? () => setActiveTab('editor')     // jump to editor
                      : onApply                          // first‑time "Apply"
                  }
                  disabled={isApplying}
                  className={`w-full px-4 py-2 rounded-md font-vastago ${
                    isDark ? 'bg-claude-orange text-[#1a1a1a]' : 'bg-claude-orange text-white'
                  }`}
                >
                  {isApplying ? 'Generating...' : hasApplied ? 'Edit Email' : 'Generate Email'}
                </button>

                {/* always show mail app button once we have a draft */}
                {draftEmail && (
                  <button
                    onClick={handleMailto}
                    className="w-full mt-2 px-4 py-2 rounded-md font-vastago bg-claude-orange-dark text-white"
                  >
                    Send via Mail App
                  </button>
                )}

                {/* manual link fallback */}
                {backupMailtoLink && draftEmail && (
                  <p className={`text-xs mt-2 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>
                    <a href={backupMailtoLink} target="_blank" rel="noopener noreferrer" className="underline">
                      Click to email manually
                    </a>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <EmailEditor
              draftEmail={draftEmail}
              setDraftEmail={setDraftEmail}
              professor={professor}
              isDark={isDark}
            />
          )}
        </div>
      </div>
    </div>
  );
}