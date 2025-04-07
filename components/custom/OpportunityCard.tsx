import React from 'react';
import Image from 'next/image';
import { ResearchOpportunity } from './OpportunityModal';

type OpportunityCardProps = {
  opportunity: ResearchOpportunity;
  onClick: () => void;
};

export default function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="h-48 relative">
        <Image
          src={opportunity.image}
          alt={opportunity.title}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{opportunity.title}</h3>
        <p className="text-blue-700 font-medium mb-1">{opportunity.professor}</p>
        <p className="text-gray-600 mb-3">{opportunity.department}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {opportunity.researchAreas.slice(0, 2).map((area, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {area}
            </span>
          ))}
          {opportunity.researchAreas.length > 2 && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              +{opportunity.researchAreas.length - 2} more
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
          </span>
          <button onClick={onClick} className="text-blue-600 hover:text-blue-800 font-medium transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
