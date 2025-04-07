import React from 'react';
import Link from 'next/link';

export type Professor = {
  profile_link: string;
  name: string;
  email: string;
  department: string;
  research_areas: string[];
  preferred_majors: string[];
  research_description: string;
  currently_looking_for: string;
  cs_subdomain: string;
};

type ProfessorCardProps = {
  professor: Professor;
  onClick: () => void;
};

export default function ProfessorCard({ professor, onClick }: ProfessorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{professor.name}</h3>
        <p className="text-blue-700 font-medium mb-3">{professor.department}</p>
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Research Areas</h4>
          <div className="flex flex-wrap gap-1">
            {professor.research_areas.slice(0, 3).map((area, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {area.replace(/[[\]']+/g, '')}
              </span>
            ))}
            {professor.research_areas.length > 3 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                +{professor.research_areas.length - 3} more
              </span>
            )}
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Research Focus</h4>
          <p className="text-gray-600 text-sm line-clamp-3 min-h-[4em]">
            {professor.research_description || 'No description available'}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          {professor.currently_looking_for && (
            <span className="text-sm text-gray-500">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Looking for Researchers</h4>
              {professor.currently_looking_for || 'No description available'}
            </span>
          )}
          <button onClick={onClick} className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1">
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
