'use client'

import { useTheme } from '../lib/hooks/useTheme';
import { vastago } from '../fonts';

export default function DashboardLoading() {
  const { isDark } = useTheme();
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center initial-loading transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'}`}>
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <div className={`flex space-x-2 ${vastago.className}`}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`h-5 w-5 rounded-full ${isDark ? 'bg-claude-orange/90' : 'bg-claude-orange'} animate-pulse`}
                style={{
                  animationDelay: `${index * 0.15}s`,
                  animationDuration: '1.2s'
                }}
              ></div>
            ))}
          </div>
        </div>
        <p className={`text-xl ${vastago.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} opacity-0 animate-fadeIn`}
           style={{ animationDelay: '0.3s', animationDuration: '0.8s', animationFillMode: 'forwards' }}>
          Preparing your dashboard...
        </p>
      </div>
    </div>
  );
} 