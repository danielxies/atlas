import React from 'react';
import { Job } from '@/app/api/jobs/route';
import { alice, vastago } from '@/app/fonts';

type JobCardProps = {
  job: Job;
  onClick: () => void;
  isDark?: boolean;
};

const JobCard: React.FC<JobCardProps> = ({ job, onClick, isDark = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-4 ${
        isDark ? 'bg-[#2A2A2A] hover:bg-[#333333]' : 'bg-white hover:bg-gray-50'
      } border ${
        isDark ? 'border-gray-800' : 'border-gray-200'
      } rounded-lg transition-colors cursor-pointer`}
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
          {job.logo ? (
            <img src={job.logo} alt={`${job.company} logo`} className="h-full w-full object-cover" />
          ) : (
            <div className={`h-12 w-12 ${isDark ? 'bg-claude-orange' : 'bg-black'} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${isDark ? 'text-[#1a1a1a]' : 'text-white'} ${alice.className}`}>
                {job.company.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} ${alice.className}`}>
            {job.title}
          </h3>
          <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} ${vastago.className}`}>
            {job.company} · {job.location}
          </p>
          {job.salary && (
            <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} text-sm ${vastago.className}`}>
              {job.salary}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {job.tags.map((tag, i) => (
              <span 
                key={i} 
                className={`px-2 py-1 text-xs rounded-full ${
                  isDark ? 'bg-gray-800 text-[#d1cfbf]/80' : 'bg-gray-100 text-gray-800'
                } ${vastago.className}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard; 