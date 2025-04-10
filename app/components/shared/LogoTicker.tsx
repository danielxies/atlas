"use client";

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!scrollerRef.current || !innerRef.current) return;
    
    // Clone logos to create seamless effect
    const scrollerContent = Array.from(innerRef.current.children);
    scrollerContent.forEach((item) => {
      const duplicate = item.cloneNode(true);
      innerRef.current?.appendChild(duplicate);
    });
  }, []);

  return (
    <div 
      className={cn(
        "relative overflow-hidden w-full",
        "bg-transparent"
      )}
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
          transform: scale(1.1) translateZ(40px) !important;
          filter: brightness(1.1);
        }
      `}</style>

      {/* Main scroller with perspective */}
      <div
        ref={scrollerRef}
        className="py-12 perspective-[800px] overflow-hidden bg-transparent"
      >
        {/* Gradient overlay for fade effect on edges */}
        <div 
          className="absolute inset-y-0 left-0 w-24 z-10"
          style={{
            background: isDark 
              ? `linear-gradient(to right, rgba(26, 26, 26, 0.95), transparent)` 
              : `linear-gradient(to right, rgba(232, 230, 217, 0.95), transparent)`
          }}
        ></div>
        <div 
          className="absolute inset-y-0 right-0 w-24 z-10"
          style={{
            background: isDark 
              ? `linear-gradient(to left, rgba(26, 26, 26, 0.95), transparent)` 
              : `linear-gradient(to left, rgba(232, 230, 217, 0.95), transparent)`
          }}
        ></div>

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
              "transform-style-preserve-3d"
            )}
            style={{
              // Start with some spacing to prevent initial jump
              paddingLeft: '6px', // Reduced padding to bring logos closer
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