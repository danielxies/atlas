import React, { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { vastago } from '@/app/fonts';

interface ScrollableSectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  isDark: boolean;
  children: ReactNode;
}

const ScrollableSection: React.FC<ScrollableSectionProps> = ({
  id,
  title,
  icon: Icon,
  isDark,
  children
}) => {
  // Function to handle scrolling
  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className={`${isDark ? 'text-claude-orange' : 'text-claude-orange-dark'}`} />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} ${vastago.className}`}>
            {title}
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-[#d1cfbf]' : 'hover:bg-gray-200 text-gray-700'}`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-[#d1cfbf]' : 'hover:bg-gray-200 text-gray-700'}`}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div id={id} className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
        {children}
      </div>
    </section>
  );
};

export default ScrollableSection; 