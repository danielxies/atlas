import React from 'react';
import { ResearchProgram, ResearchProject, LastMinuteOpportunity } from '@/app/types/dashboard';
import { alice, vastago } from '@/app/fonts';

interface OpportunityCardProps {
  item: ResearchProgram | ResearchProject | LastMinuteOpportunity;
  isDark: boolean;
  onClick: () => void;
  imageUrl?: string;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ 
  item, 
  isDark, 
  onClick,
  imageUrl 
}) => {
  // Determine if the item is a ResearchProgram
  const isProgram = 'institution' in item && 'thumbnailUrl' in item;
  // Determine if the item is a ResearchProject
  const isProject = 'category' in item && 'lastUpdated' in item;
  // Determine if the item is a LastMinuteOpportunity
  const isLastMinute = 'institution' in item && !('thumbnailUrl' in item);

  return (
    <div
      className={`flex-none w-80 rounded-lg overflow-hidden shadow-lg ${
        isDark ? 'bg-[#262626] hover:bg-[#2e2e2e]' : 'bg-white hover:bg-gray-50'
      } transition-colors`}
    >
      {/* Image section for programs and last minute opportunities */}
      {(isProgram || isLastMinute) && (
        <div className="h-44 overflow-hidden">
          <img
            src={isProgram ? (item as ResearchProgram).thumbnailUrl : imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className={`text-lg font-semibold mb-1 ${alice.className} ${
          isDark ? 'text-[#d1cfbf]' : 'text-gray-900'
        }`}>
          {item.title}
        </h3>
        
        {/* Subtitle - institution for programs, category for projects */}
        <p className={`text-sm ${vastago.className} ${
          isDark ? 'text-[#d1cfbf]/80' : 'text-gray-700'
        }`}>
          {isProgram || isLastMinute ? 
            (item as ResearchProgram | LastMinuteOpportunity).institution : 
            (item as ResearchProject).category
          }
        </p>
        
        {/* Date information */}
        <p className={`text-sm ${vastago.className} ${
          isDark ? 'text-[#d1cfbf]/70' : 'text-gray-600'
        } mt-2`}>
          {isProject ? (
            <>Updated: {new Date((item as ResearchProject).lastUpdated).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })}</>
          ) : (
            <>Deadline: {new Date((item as ResearchProgram | LastMinuteOpportunity).deadline).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'short', day: 'numeric' 
            })}</>
          )}
        </p>
        
        {/* View Details button */}
        <button
          onClick={onClick}
          className={`mt-4 text-sm font-medium px-4 py-2 rounded ${
            isDark ? 
              'bg-claude-orange/90 hover:bg-claude-orange text-[#1a1a1a]' : 
              'bg-claude-orange-dark hover:bg-claude-orange text-white'
          } transition-colors ${vastago.className}`}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard; 