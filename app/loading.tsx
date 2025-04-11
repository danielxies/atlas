'use client'

import { useTheme } from './lib/hooks/useTheme';
import { vastago } from './fonts';

export default function Loading() {
  const { isDark } = useTheme();
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center initial-loading transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'}`}>
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <div className={`flex space-x-2 ${vastago.className}`}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`h-4 w-4 rounded-full ${isDark ? 'bg-claude-orange/90' : 'bg-claude-orange'} animate-bounce`}
                style={{
                  animationDelay: `${index * 0.15}s`,
                  animationDuration: '0.8s'
                }}
              ></div>
            ))}
          </div>
        </div>
        <p className={`text-lg ${vastago.className} ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'}`}>
          Loading Atlas...
        </p>
      </div>
    </div>
  );
} 