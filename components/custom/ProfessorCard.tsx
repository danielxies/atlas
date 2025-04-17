import React from 'react';
import Link from 'next/link';
import { alice, vastago } from '@/app/fonts';

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
  isDark?: boolean;
};

export default function ProfessorCard({ professor, onClick, isDark = false }: ProfessorCardProps) {
  return (
    <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition`}>
      <div className="p-5">
        <h3 
          onClick={onClick} 
          className={`text-xl font-semibold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} mb-2 font-vastago hover:underline cursor-pointer`}
        >
          {professor.name}
        </h3>
        <p className={`${isDark ? 'text-claude-orange' : 'text-claude-orange'} font-medium mb-3 font-vastago`}>{professor.department}</p>
        <div className="mb-3">
          <h4 className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} mb-1 font-vastago`}>Research Areas</h4>
          <div className="flex flex-wrap gap-1">
            {professor.research_areas.slice(0, 3).map((area, index) => (
              <span key={index} className={`${isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-claude-orange/10 text-claude-orange'} text-xs px-2 py-1 rounded-full font-vastago`}>
                {area.replace(/[[\]']+/g, '')}
              </span>
            ))}
            {professor.research_areas.length > 3 && (
              <span className={`${isDark ? 'bg-[#333333] text-[#d1cfbf]/80' : 'bg-gray-100 text-gray-700'} text-xs px-2 py-1 rounded-full font-vastago`}>
                +{professor.research_areas.length - 3} more
              </span>
            )}
          </div>
        </div>
        <div className="mb-4">
          <h4 className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} mb-1 font-vastago`}>Research Focus</h4>
          <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} text-sm line-clamp-3 min-h-[4em] font-vastago`}>
            {professor.research_description || 'No description available'}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          {/*
          {professor.currently_looking_for && (
            <span className={`text-sm ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'}`}>
              <h4 className={`text-sm font-medium ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} mb-1 font-vastago`}>Looking for Researchers</h4>
              <p className="font-vastago">{professor.currently_looking_for || 'No description available'}</p>
            </span>
          )}
          */}
          <button 
            onClick={onClick} 
            className={`${isDark ? 'text-claude-orange hover:text-claude-orange/80' : 'text-claude-orange hover:text-claude-orange/80'} font-medium transition flex items-center gap-1 font-vastago`}
          >
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
