import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sun, Moon, Search, Sliders } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import DxButton from '@/components/danielxie/dxButton';

interface OpportunitiesNavbarProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedSchool: string;
  setSelectedSchool: (value: string) => void;
  selectedMajor: string;
  setSelectedMajor: (value: string) => void;
  departments: string[];
  applyFilters: () => void;
  resetFilters: () => void;
  handleSearch: () => void;
  children?: React.ReactNode;
}

const OpportunitiesNavbar: React.FC<OpportunitiesNavbarProps> = ({
  isDark, 
  setIsDark, 
  searchQuery, 
  setSearchQuery,
  selectedSchool,
  setSelectedSchool,
  selectedMajor,
  setSelectedMajor,
  departments,
  applyFilters,
  resetFilters,
  handleSearch,
  children
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = () => {
    applyFilters();
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    resetFilters();
    setShowFilters(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // No immediate search
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    // No immediate search
  };

  // Handle school selection change
  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(e.target.value);
    // No immediate search
  };

  // Handle major selection change
  const handleMajorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMajor(e.target.value);
    // No immediate search
  };

  return (
    <nav className={`w-full px-6 py-4 z-50 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'} shadow-sm`}>
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <Image 
            src="/icon.png" 
            alt="Atlas Logo" 
            width={32} 
            height={32}
            onClick={() => router.push('/')} 
            className="cursor-pointer"
          />
          <span className={`font-vastago ${isDark ? 'text-[#d1cfbf]' : 'text-black'} text-xl font-semibold`}>Atlas</span>
          {children}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2 w-[700px]">
          {/* Search input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Search professors..."
              className={`pl-10 pr-4 py-2 w-full rounded-lg ${
                isDark 
                  ? 'bg-[#333] text-[#d1cfbf] placeholder-gray-500 border-[#444]' 
                  : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
              } border focus:outline-none focus:ring-1 focus:ring-claude-orange`}
            />
          </div>
          
          {/* Search button */}
          <button 
            onClick={() => {/* Search functionality removed */}}
            className={`px-3 py-2 rounded-lg ${
              isDark 
                ? 'bg-[#333] text-[#d1cfbf] hover:bg-[#444]' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border ${isDark ? 'border-[#444]' : 'border-gray-300'}`}
          >
            Search
          </button>
          
          {/* Filter button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg flex items-center gap-1 ${
              isDark 
                ? 'bg-[#333] text-[#d1cfbf] hover:bg-[#444]' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border ${isDark ? 'border-[#444]' : 'border-gray-300'}`}
          >
            <Sliders size={16} />
            <span>Filters</span>
          </button>
        </div>

        {/* Right Side - Links, Theme Toggle and UserButton */}
        <div className="flex items-center gap-3 ml-auto">
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
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg ${isDark ? 'text-[#d1cfbf] hover:bg-white/10' : 'text-black hover:bg-black/10'} transition-colors`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Filters dropdown overlay */}
      {showFilters && (
        <div className="absolute left-0 right-0 mx-6 mt-2 z-50">
          <div className={`p-6 rounded-lg ${
            isDark ? 'bg-[#333] border-[#444]' : 'bg-white border-gray-300'
          } border shadow-lg max-w-2xl mx-auto`}>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'}`}>
              Filter Opportunities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  School
                </label>
                <select
                  value={selectedSchool}
                  onChange={handleSchoolChange}
                  className={`w-full p-3 rounded-lg ${
                    isDark 
                      ? 'bg-[#222] text-[#d1cfbf] border-[#444]' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } border focus:outline-none focus:ring-1 focus:ring-claude-orange`}
                >
                  <option value="">All Schools</option>
                  <option value="purdue">Purdue University</option>
                </select>
              </div>
              
              {/* Major/Department filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Department or Preferred Major
                </label>
                <select
                  value={selectedMajor}
                  onChange={handleMajorChange}
                  className={`w-full p-3 rounded-lg ${
                    isDark 
                      ? 'bg-[#222] text-[#d1cfbf] border-[#444]' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } border focus:outline-none focus:ring-1 focus:ring-claude-orange`}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Filter action buttons */}
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={handleResetFilters}
                className={`px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-[#222] text-[#d1cfbf] hover:bg-[#2a2a2a] border-[#444]' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                } border`}
              >
                Reset
              </button>
              <DxButton
                onClick={handleApplyFilters}
                bgColor={isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'}
                textColor={isDark ? 'text-[#d1cfbf]' : 'text-black'}
                hoverColor={isDark ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#d8d6c9]'}
                border={isDark ? 'border border-[#444]' : 'border border-gray-300'}
                padding="px-4 py-2"
              >
                Apply
              </DxButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default OpportunitiesNavbar; 