import React from 'react';
import { BookOpen } from 'lucide-react';
import { DeadlineItem } from '@/app/types/dashboard';
import { vastago } from '@/app/fonts';

interface UpcomingDeadlinesProps {
  deadlines: DeadlineItem[];
  isDark: boolean;
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ deadlines, isDark }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <BookOpen className={`mr-2 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} />
        <h2 className={`text-2xl ${vastago.className}`}>Upcoming Deadlines</h2>
      </div>
      
      <div className={`rounded-lg ${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} shadow-md overflow-hidden`}>
        {deadlines.map((deadline, index) => (
          <div 
            key={deadline.id}
            className={`p-4 flex justify-between items-center ${
              index !== deadlines.length - 1 
                ? `border-b ${isDark ? 'border-[#3a3a3a]' : 'border-gray-200'}` 
                : ''
            }`}
          >
            <div>
              <h3 className={`${vastago.className} text-lg`}>{deadline.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark ? 'bg-[#3a3a3a] text-[#d1cfbf]' : 'bg-[#e0decf] text-black'
                }`}>
                  {deadline.type}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-sm font-medium ${
                new Date(deadline.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ? 'text-red-500'
                  : isDark ? 'text-[#d1cfbf]' : 'text-black'
              }`}>
                {new Date(deadline.deadline).toLocaleDateString()}
              </span>
              <span className="text-xs opacity-70 mt-1">
                {Math.ceil((new Date(deadline.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingDeadlines; 