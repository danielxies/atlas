"use client";

import React, { useState, useEffect } from 'react';
import BrowserFrame from './BrowserFrame';

interface BrowserVideoExampleProps {
  videoSrc: string;
  isDark?: boolean;
  width?: string;
  height?: string;
  className?: string;
  posterSrc?: string;
}

/**
 * Example component that shows how to use BrowserFrame with a video
 * This is for reference only - not used in the actual application
 */
export default function BrowserVideoExample({
  videoSrc,
  isDark = false,
  width = "max-w-5xl",
  height = "max-h-80",
  className = "",
  posterSrc = "",
}: BrowserVideoExampleProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const handleVideoLoaded = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    const videoElement = document.getElementById('browser-demo-video-example') as HTMLVideoElement;
    
    if (!videoElement) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && videoElement.paused) {
          videoElement.play().catch(err => {
            console.warn('Auto-play failed:', err);
          });
        } else if (!entry.isIntersecting && !videoElement.paused) {
          videoElement.pause();
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(videoElement);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <BrowserFrame isDark={isDark} width={width} className={className}>
      <div className="flex items-center justify-center relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-claude-orange rounded-full animate-spin"></div>
          </div>
        )}
        <video 
          id="browser-demo-video-example"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          className={`w-full h-auto ${height} object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          preload="auto"
          onLoadedData={handleVideoLoaded}
          onCanPlay={handleVideoLoaded}
        />
      </div>
    </BrowserFrame>
  );
} 