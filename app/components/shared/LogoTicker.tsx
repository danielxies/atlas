"use client";

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface LogoTickerProps {
  logos: {
    src: string;
    alt: string;
  }[];
  speed?: number; // seconds per complete loop
  direction?: 'ltr' | 'rtl'; // left-to-right or right-to-left
  isDark?: boolean;
}

export default function LogoTicker({
  logos,
  speed = 88, // Increased speed to make it slower
  direction = 'rtl',
  isDark = true,
}: LogoTickerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!scrollerRef.current || !innerRef.current) return;
    
    // Clone logos to create seamless effect
    const scrollerContent = Array.from(innerRef.current.children);
    scrollerContent.forEach((item) => {
      const duplicate = item.cloneNode(true);
      innerRef.current?.appendChild(duplicate);
    });

    // Global event handler to prevent horizontal scrolling
    const preventGlobalScroll = (e: WheelEvent) => {
      // Check if the event originated from our ticker or not
      if (!isEventFromTicker(e)) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
      }
    };
    
    // Check if an event originated from our ticker component
    const isEventFromTicker = (e: Event): boolean => {
      if (!containerRef.current) return false;
      return containerRef.current.contains(e.target as Node);
    };

    // Add global scroll prevention
    document.addEventListener('wheel', preventGlobalScroll, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', preventGlobalScroll);
    };
  }, []);

  // Handle mouse enter/leave for the entire component
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden w-full",
        "bg-transparent",
        isHovering ? "overflow-x-auto" : "overflow-x-hidden" // Only allow horizontal scroll when hovering
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        // Make sure the ticker follows the width correctly
        maxWidth: '100vw',
        width: '100%'
      }}
    >
      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        .logo-scroll {
          animation: scroll ${speed}s linear infinite;
          animation-direction: ${direction === 'rtl' ? 'normal' : 'reverse'};
          will-change: transform;
        }
        
        .logo-item {
          transition: transform 0.3s ease-out;
        }
        
        .logo-item:hover {
          transform: scale(1.05) translateZ(20px) !important; /* Reduce scale effect */
          filter: brightness(1.1);
        }
        
        /* Custom scrollbar for the ticker when hovering */
        .ticker-container::-webkit-scrollbar {
          height: 6px;
        }
        
        .ticker-container::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(26, 26, 26, 0.2)' : 'rgba(232, 230, 217, 0.2)'};
        }
        
        .ticker-container::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
          border-radius: 3px;
        }
      `}</style>

      {/* Main scroller with perspective */}
      <div
        ref={scrollerRef}
        className={cn(
          "py-12 perspective-[800px] bg-transparent",
          isHovering ? "ticker-container" : "overflow-hidden touch-none"
        )}
      >
        {/* Gradient overlay for fade effect on edges */}
        {!isHovering && (
          <>
            <div 
              className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
              style={{
                background: isDark 
                  ? `linear-gradient(to right, rgba(26, 26, 26, 0.95), transparent)` 
                  : `linear-gradient(to right, rgba(232, 230, 217, 0.95), transparent)`
              }}
            ></div>
            <div 
              className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
              style={{
                background: isDark 
                  ? `linear-gradient(to left, rgba(26, 26, 26, 0.95), transparent)` 
                  : `linear-gradient(to left, rgba(232, 230, 217, 0.95), transparent)`
              }}
            ></div>
          </>
        )}

        {/* The cylinder effect is created by rotating the container a bit */}
        <div 
          className="transform-style-preserve-3d w-full"
          style={{
            transform: 'rotateX(8deg)',
          }}
        >
          <div 
            ref={innerRef}
            className={cn(
              "flex items-center whitespace-nowrap transform-gpu logo-scroll",
              isHovering && "animation-play-state-paused",
              "transform-style-preserve-3d"
            )}
            style={{
              // Start with some spacing to prevent initial jump
              paddingLeft: '6px', // Reduced padding to bring logos closer
              animationPlayState: isHovering ? 'paused' : 'running',
            }}
          >
            {logos.map((logo, idx) => {
              // Calculate a slight rotation to create curved effect
              // Each logo is rotated slightly to create a cylinder-like appearance
              const rotation = -15 + (idx % logos.length) * (30 / logos.length);
              
              return (
                <div 
                  key={idx} 
                  className="mx-8 flex-shrink-0 p-4 logo-item" // Reduced margin to bring logos closer
                  style={{
                    transform: `rotateY(${rotation}deg) translateZ(25px)`,
                    transformOrigin: 'center center',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <img 
                    src={logo.src} 
                    alt={logo.alt}
                    className={cn(
                      "h-14 w-auto object-contain transition-all duration-300",
                      // Preserve original colors instead of inverting
                      "filter drop-shadow-sm",
                      isDark ? "brightness-100" : "brightness-90 hover:brightness-100",
                      "max-w-[150px]"
                    )}
                    // Preload images to avoid flickering
                    loading="eager"
                    draggable="false"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Subtle reflection */}
      <div className="h-12 w-full bg-gradient-to-b from-black/10 to-transparent opacity-20"></div>
    </div>
  );
} 