"use client";

import React, { ReactNode } from 'react';

interface BrowserFrameProps {
  children: ReactNode;
  isDark?: boolean;
  width?: string;
  className?: string;
  shadow?: boolean;
}

/**
 * A browser-like frame component that can wrap any content
 */
export default function BrowserFrame({
  children,
  isDark = false,
  width = "max-w-5xl",
  className = "",
  shadow = true,
}: BrowserFrameProps) {
  return (
    <div className={`${width} mx-auto px-6 ${className}`}>
      <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} p-4 rounded-lg ${shadow ? 'shadow-xl' : ''} overflow-hidden`}>
        {/* Browser bar with dots */}
        <div className="w-full bg-gray-200 h-8 rounded-t-lg flex items-center px-2 gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="flex-1 flex justify-center">
            <div className="w-1/2 h-5 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        
        {/* Content container */}
        <div className={`w-full ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'} rounded-b-lg`}>
          {children}
        </div>
      </div>
    </div>
  );
} 