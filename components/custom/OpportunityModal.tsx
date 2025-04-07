import React from 'react';

export type ResearchOpportunity = {
  id: string;
  title: string;
  professor: string;
  department: string;
  researchAreas: string[];
  description: string;
  requirements: string[];
  datePosted: string;
  deadline: string;
  image: string;
};

type OpportunityModalProps = {
  opportunity: ResearchOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
};

export default function OpportunityModal({
  opportunity,
  isOpen,
  onClose,
  onApply,
}: OpportunityModalProps) {
  if (!isOpen || !opportunity) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
              {opportunity.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Project Details</h3>
                <p className="text-gray-700">{opportunity.description}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Requirements</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Research Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.researchAreas.map((area, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-3">Faculty Information</h3>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Professor</p>
                <p className="font-medium">{opportunity.professor}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{opportunity.department}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Date Posted</p>
                <p className="font-medium">{new Date(opportunity.datePosted).toLocaleDateString()}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Application Deadline</p>
                <p className="font-medium">{new Date(opportunity.deadline).toLocaleDateString()}</p>
              </div>
              <button
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mt-4"
                onClick={onApply}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
