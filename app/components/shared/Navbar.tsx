import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { UserButton, useAuth } from '@clerk/nextjs';

interface NavbarProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, setIsDark, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav className={`w-full px-6 py-4 z-50 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'} shadow-sm`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image 
            src="/icon.png" 
            alt="Atlas Logo" 
            width={32} 
            height={32}
            onClick={() => router.push('/')} 
            className="cursor-pointer"
          />
          <span className={`font-vastago ${isDark ? 'text-[#d1cfbf]' : 'text-black'} text-xl font-semibold`}>Atlas</span>
        </div>

        {/* Custom children element for back button etc */}
        {children}

        {/* Right Side - Links, Theme Toggle and UserButton */}
        <div className="flex items-center gap-3">
          {/* Show Login button for non-authenticated users, Opportunities for authenticated users */}
          {isLoaded && (
            isSignedIn ? (
              <>
                <Link 
                  href="/opportunities" 
                  className={`${
                    pathname === '/opportunities' 
                      ? `${isDark ? 'text-claude-orange' : 'text-claude-orange'} font-medium` 
                      : `${isDark ? 'text-[#d1cfbf]' : 'text-black'} hover:text-claude-orange`
                  } transition font-vastago px-3`}
                >
                  Opportunities
                </Link>
                <Link 
                  href="/chat" 
                  className={`${
                    pathname === '/chat' 
                      ? `${isDark ? 'text-claude-orange' : 'text-claude-orange'} font-medium` 
                      : `${isDark ? 'text-[#d1cfbf]' : 'text-black'} hover:text-claude-orange`
                  } transition font-vastago px-3`}
                >
                  Chat
                </Link>
                <Link 
                  href="/profile" 
                  className={`${
                    pathname === '/profile' 
                      ? `${isDark ? 'text-claude-orange' : 'text-claude-orange'} font-medium` 
                      : `${isDark ? 'text-[#d1cfbf]' : 'text-black'} hover:text-claude-orange`
                  } transition font-vastago px-3`}
                >
                  Profile
                </Link>
              </>
            ) : (
              <Link 
                href="/sign-in" 
                className={`${isDark ? 'text-[#d1cfbf]' : 'text-black'} hover:text-claude-orange transition font-vastago px-3`}
              >
                Login
              </Link>
            )
          )}
          
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg ${isDark ? 'text-[#d1cfbf] hover:bg-white/10' : 'text-black hover:bg-black/10'} transition-colors`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {isLoaded && isSignedIn && <UserButton afterSignOutUrl="/" />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 