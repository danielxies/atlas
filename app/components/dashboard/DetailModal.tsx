import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { ResearchProgram, ResearchProject, LastMinuteOpportunity } from '@/app/types/dashboard';
import { alice, vastago } from '@/app/fonts';

interface DetailModalProps {
  item: ResearchProgram | ResearchProject | LastMinuteOpportunity | null;
  isDark: boolean;
  onClose: () => void;
  imageUrl?: string;
}

const DetailModal: React.FC<DetailModalProps> = ({ 
  item, 
  isDark, 
  onClose,
  imageUrl
}) => {
  if (!item) return null;

  // Determine item type
  const isProgram = 'institution' in item && 'thumbnailUrl' in item;
  const isProject = 'category' in item && 'lastUpdated' in item;
  const isLastMinute = 'institution' in item && !('thumbnailUrl' in item);
  
  // Helper function to render tag list
  const renderTags = (tags?: string[], title: string = 'Research Areas') => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>{title}</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-claude-orange/20 text-claude-orange/90' : 'bg-claude-orange/10 text-claude-orange-dark'}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-gray-500/75'}`}></div>
        </div>

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full ${isDark ? 'bg-[#262626] text-[#d1cfbf]' : 'bg-white text-gray-900'}`}>
          {/* Modal header with image for program and last minute opportunities */}
          {(isProgram || isLastMinute) && (
            <div className="relative h-56 w-full">
              <img
                src={isProgram ? (item as ResearchProgram).thumbnailUrl : imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 right-0 p-2">
                <button 
                  onClick={onClose}
                  className={`p-2 rounded-full ${isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'} transition`}
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
          )}
          
          {/* Close button for projects (no image) */}
          {isProject && (
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={onClose}
                className="rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-claude-orange-dark"
              >
                <X size={24} className={isDark ? 'text-[#d1cfbf]' : 'text-gray-500'} />
              </button>
            </div>
          )}
          
          {/* Modal content */}
          <div className="p-6">
            <h3 className={`text-2xl font-bold mb-2 ${alice.className} ${isProject ? 'pr-8' : ''}`}>{item.title}</h3>
            
            {/* Badges */}
            <div className="flex items-center space-x-2 mb-4">
              {(isProgram || isLastMinute) && (
                <div className={`text-sm px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'} ${vastago.className}`}>
                  {(item as ResearchProgram | LastMinuteOpportunity).institution}
                </div>
              )}
              
              {'department' in item && item.department && (
                <div className={`text-sm px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'} ${vastago.className}`}>
                  {item.department}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              {/* Description */}
              <div className={`mb-4 ${vastago.className} ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'}`}>
                {item.description || "No description available."}
              </div>
              
              {/* Details grid */}
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 mb-4">
                {isProject && (
                  <>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Category</dt>
                      <dd className="mt-1 text-sm">{(item as ResearchProject).category}</dd>
                    </div>
                    {(item as ResearchProject).professorName && (
                      <div className="sm:col-span-1">
                        <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Professor</dt>
                        <dd className="mt-1 text-sm">{(item as ResearchProject).professorName}</dd>
                      </div>
                    )}
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Last Updated</dt>
                      <dd className="mt-1 text-sm">
                        {new Date((item as ResearchProject).lastUpdated).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </dd>
                    </div>
                  </>
                )}
                
                {(isProgram || isLastMinute) && (
                  <>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Location</dt>
                      <dd className="mt-1 text-sm">
                        {(item as ResearchProgram | LastMinuteOpportunity).location || 
                         (item as ResearchProgram | LastMinuteOpportunity).institution}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Duration</dt>
                      <dd className="mt-1 text-sm">
                        {(item as ResearchProgram | LastMinuteOpportunity).duration || "Not specified"}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Deadline</dt>
                      <dd className="mt-1 text-sm">
                        {new Date((item as ResearchProgram | LastMinuteOpportunity).deadline).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Funding</dt>
                      <dd className="mt-1 text-sm">
                        {(item as ResearchProgram | LastMinuteOpportunity).funding || "Information not available"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
              
              {/* Eligibility */}
              {'eligibility' in item && item.eligibility && (
                <div className="mb-4">
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Eligibility</h4>
                  <p className={`text-sm ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'}`}>
                    {(item as ResearchProgram | LastMinuteOpportunity).eligibility}
                  </p>
                </div>
              )}
              
              {/* Skills (for projects) */}
              {isProject && (item as ResearchProject).skills && (item as ResearchProject).skills!.length > 0 && (
                <div className="mb-4">
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-[#d1cfbf]/70' : 'text-gray-500'}`}>Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(item as ResearchProject).skills!.map((skill, index) => (
                      <span 
                        key={index} 
                        className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-[#333] text-[#d1cfbf]' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tags */}
              {'tags' in item && renderTags(item.tags)}
              
              {/* Majors (for last minute opportunities) */}
              {isLastMinute && (item as LastMinuteOpportunity).majors && 
                renderTags((item as LastMinuteOpportunity).majors, 'Relevant Majors')}
            </div>
            
            {/* Application URL for programs and opportunities */}
            {(isProgram || isLastMinute) && (item as ResearchProgram | LastMinuteOpportunity).applicationUrl && (
              <div className="flex justify-end mt-4 border-t pt-4 border-gray-200">
                <a
                  href={(item as ResearchProgram | LastMinuteOpportunity).applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 text-sm font-medium rounded ${
                    isDark ? 'bg-claude-orange text-black hover:bg-claude-orange/90' : 
                            'bg-claude-orange-dark text-white hover:bg-claude-orange/90'
                  } transition-colors ${vastago.className}`}
                >
                  Apply Now
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal; 