import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

interface ProfileHeaderProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  router: any;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isDark, setIsDark, router }) => {
  return (
    <nav className={`w-full px-6 py-4 z-50 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'} shadow-sm`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
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

        {/* Right Side - Theme Toggle and links */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg ${isDark ? 'text-[#d1cfbf] hover:bg-white/10' : 'text-black hover:bg-black/10'} transition-colors`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href="/opportunities" className={`${isDark ? 'text-[#d1cfbf]' : 'text-black'} hover:text-claude-orange transition font-vastago px-3`}>
            Opportunities
          </Link>
          <Link href="/dashboard" className={`${isDark ? 'text-claude-orange' : 'text-claude-orange'} font-medium transition font-vastago px-3`}>
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
};

export default ProfileHeader; 