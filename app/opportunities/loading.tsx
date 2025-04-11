'use client'

import { useTheme } from '../lib/hooks/useTheme';
import { vastago } from '../fonts';

export default function OpportunitiesLoading() {
  const { isDark } = useTheme();
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center initial-loading transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'}`}>
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className={`w-16 h-16 border-4 rounded-full ${isDark ? 'border-claude-orange/30' : 'border-claude-orange/20'}`}></div>
          <div 
            className={`absolute top-0 left-0 w-16 h-16 border-4 border-t-transparent rounded-full ${isDark ? 'border-claude-orange/90' : 'border-claude-orange'} animate-spin`}
            style={{ animationDuration: '1.2s' }}
          ></div>
        </div>
        <p className={`text-xl ${vastago.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} opacity-0 animate-fadeIn`}
           style={{ animationDelay: '0.3s', animationDuration: '0.8s', animationFillMode: 'forwards' }}>
          Finding opportunities...
        </p>
      </div>
    </div>
  );
} 