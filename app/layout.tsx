'use client';

import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './lib/hooks/useTheme';
import { alice, vastago } from './fonts';

// Custom script to handle initial loading state
const initialLoadingScript = `
  (function() {
    // Create and append initial loading indicator
    function createInitialLoadingIndicator() {
      const loadingContainer = document.createElement('div');
      loadingContainer.id = 'initial-loading-indicator';
      loadingContainer.style.position = 'fixed';
      loadingContainer.style.inset = '0';
      loadingContainer.style.display = 'flex';
      loadingContainer.style.alignItems = 'center';
      loadingContainer.style.justifyContent = 'center';
      loadingContainer.style.backgroundColor = 'var(--initial-bg-color)';
      loadingContainer.style.color = 'var(--initial-text-color)';
      loadingContainer.style.zIndex = '9999';
      loadingContainer.style.transition = 'opacity 0.3s ease-out';
      loadingContainer.style.fontFamily = 'vastago, sans-serif';
      
      // Create dots container
      const dotsContainer = document.createElement('div');
      dotsContainer.style.display = 'flex';
      dotsContainer.style.gap = '8px';
      dotsContainer.style.marginBottom = '16px';
      
      // Add dots
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.style.width = '12px';
        dot.style.height = '12px';
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = '#f97316'; // claude-orange color
        
        // Add animation
        dot.style.animation = 'bounce 0.8s infinite';
        dot.style.animationDelay = (i * 0.15) + 's';
        dotsContainer.appendChild(dot);
      }
      
      // Add text
      const text = document.createElement('p');
      text.textContent = 'Loading Atlas...';
      text.style.fontSize = '18px';
      
      // Create inner container to hold both
      const innerContainer = document.createElement('div');
      innerContainer.style.display = 'flex';
      innerContainer.style.flexDirection = 'column';
      innerContainer.style.alignItems = 'center';
      
      innerContainer.appendChild(dotsContainer);
      innerContainer.appendChild(text);
      loadingContainer.appendChild(innerContainer);
      
      // Add bounce animation style
      const style = document.createElement('style');
      style.textContent = \`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      \`;
      document.head.appendChild(style);
      
      document.body.appendChild(loadingContainer);
      
      return loadingContainer;
    }
    
    // Remove the loading indicator when page is fully loaded
    function removeLoadingIndicator(indicator) {
      if (!indicator) return;
      
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator && indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300); // match the transition duration
    }
    
    const loadingIndicator = createInitialLoadingIndicator();
    
    // Remove loading indicator after React has hydrated
    window.addEventListener('load', function() {
      // Give React a moment to hydrate
      setTimeout(() => {
        removeLoadingIndicator(loadingIndicator);
      }, 500);
    });
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${alice.variable} ${vastago.variable}`}>
        <head>
          <script dangerouslySetInnerHTML={{ __html: initialLoadingScript }} />
        </head>
        <body>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}