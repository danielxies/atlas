"use client";

import React, { useState, useEffect } from 'react';

interface BrowserVideoDemoProps {
  videoSrc: string;
  isDark?: boolean;
  width?: string;
  height?: string;
  className?: string;
  posterSrc?: string;
}

export default function BrowserVideoDemo({
  videoSrc,
  isDark = false,
  width = "max-w-6xl",
  height = "max-h-[500px]",
  className = "",
  posterSrc = "",
}: BrowserVideoDemoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Handle video load event
  const handleVideoLoaded = () => {
    setIsLoaded(true);
  };

  // Use Intersection Observer to only load video when in viewport
  useEffect(() => {
    const videoElement = document.getElementById('browser-demo-video') as HTMLVideoElement;
    
    if (!videoElement) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If video is in viewport and not already playing
        if (entry.isIntersecting && videoElement.paused) {
          videoElement.play().catch(err => {
            console.warn('Auto-play failed:', err);
          });
        } else if (!entry.isIntersecting && !videoElement.paused) {
          // Pause when out of viewport to save resources
          videoElement.pause();
        }
      });
    }, { threshold: 0.1 }); // Trigger when at least 10% is visible
    
    observer.observe(videoElement);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`${width} mx-auto px-6 ${className}`}>
      <div className={`${isDark ? 'bg-[#121212]' : 'bg-claude-orange'} rounded-lg p-6 overflow-hidden flex items-center justify-center relative`}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        <video 
          id="browser-demo-video"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          className={`rounded-lg w-full h-auto ${height} object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          preload="auto"
          onLoadedData={handleVideoLoaded}
          onCanPlay={handleVideoLoaded}
        />
      </div>
    </div>
  );
} 