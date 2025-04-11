'use client';

import { useState, useEffect, createContext, useContext } from 'react';

type ThemeContextType = {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Inject a script into the document head to set the theme before React loads
const themeScript = `
  (function() {
    function getInitialTheme() {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      return savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light';
    }

    const initialTheme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // Add initial CSS styles to prevent flash
    const isDark = initialTheme === 'dark';
    document.documentElement.style.setProperty('--initial-bg-color', isDark ? '#1a1a1a' : '#e8e6d9');
    document.documentElement.style.setProperty('--initial-text-color', isDark ? '#d1cfbf' : '#1a1a1a');

    // Apply initial background color to body and html
    document.documentElement.style.backgroundColor = isDark ? '#1a1a1a' : '#e8e6d9';
    document.body.style.backgroundColor = isDark ? '#1a1a1a' : '#e8e6d9';
  })();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
    }
    
    setIsLoaded(true);
  }, []);

  // Update localStorage and document attributes when theme changes
  useEffect(() => {
    if (!isLoaded) return;
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.style.backgroundColor = isDark ? '#1a1a1a' : '#e8e6d9';
    document.body.style.backgroundColor = isDark ? '#1a1a1a' : '#e8e6d9';
  }, [isDark, isLoaded]);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <ThemeContext.Provider value={{ isDark, setIsDark }}>
        {children}
      </ThemeContext.Provider>
    </>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 