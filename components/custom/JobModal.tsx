import React from 'react';
import { Job } from '@/app/api/jobs/route';
import { alice, vastago } from '@/app/fonts';

type JobModalProps = {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying?: boolean;
  hasApplied?: boolean;
  isDark?: boolean;
};

const JobModal: React.FC<JobModalProps> = ({ 
  job, 
  isOpen, 
  onClose, 
  onApply,
  isApplying = false,
  hasApplied = false,
  isDark = false 
}) => {
  if (!isOpen || !job) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} mb-1 ${alice.className}`}>
                {job.title}
              </h2>
              <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} ${vastago.className}`}>
                {job.company} · {job.location}
              </p>
              {job.salary && (
                <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} text-sm mt-1 ${vastago.className}`}>
                  {job.salary}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-[#d1cfbf]/60 hover:text-[#d1cfbf]' : 'text-gray-500 hover:text-gray-700'} transition p-1 rounded-full`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-6">
            {job.description && (
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} ${alice.className}`}>About the job</h3>
                <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-700'} whitespace-pre-line ${vastago.className}`}>
                  {job.description}
                </p>
              </div>
            )}
            
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} ${alice.className}`}>Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className={`px-3 py-1 text-sm rounded-full ${
                      isDark ? 'bg-gray-800 text-[#d1cfbf]/80' : 'bg-gray-100 text-gray-800'
                    } ${vastago.className}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {job.applicants && (
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} ${alice.className}`}>Job activity</h3>
                <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} ${vastago.className}`}>
                  {job.applicants}
                </p>
                <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} mt-1 ${vastago.className}`}>
                  Be one of the first applicants
                </p>
              </div>
            )}

            {/* Apply button */}
            <div className="mt-6">
              <button
                onClick={onApply}
                disabled={isApplying}
                className={`w-full px-4 py-2 rounded-md font-medium ${vastago.className} ${
                  isDark 
                    ? 'bg-claude-orange text-[#1a1a1a] hover:bg-claude-orange/90' 
                    : 'bg-claude-orange text-white hover:bg-claude-orange/90'
                } transition-colors disabled:opacity-70`}
              >
                {isApplying ? 'Generating application...' : hasApplied ? 'Edit application' : 'Apply now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal; 