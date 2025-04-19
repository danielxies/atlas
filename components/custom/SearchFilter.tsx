import React from 'react';

type SearchFilterProps = {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedDepartment: string;
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
  isDark: boolean;
};

export default function SearchFilter({
  searchQuery,
  onSearch,
  selectedDepartment,
  showFilterModal,
  setShowFilterModal,
  isDark
}: SearchFilterProps) {
  return (
    <div className="mb-8 flex gap-4 items-start">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search by name, research area, or department..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className={`w-full px-4 py-2 border ${isDark ? 'border-gray-700 bg-[#2a2a2a] text-[#d1cfbf]' : 'border-gray-300 bg-white text-black'} rounded-lg focus:ring-2 focus:ring-claude-orange focus:border-transparent h-[42px]`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className={`h-5 w-5 ${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* Filter Button */}
      <button
        onClick={() => setShowFilterModal(true)}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 h-[42px] ${
          isDark 
            ? (selectedDepartment !== 'all' ? 'bg-claude-orange text-[#1a1a1a]' : 'bg-[#3a3a3a] text-[#d1cfbf]') 
            : (selectedDepartment !== 'all' ? 'bg-claude-orange text-white' : 'bg-gray-200 text-gray-800')
        }`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        Filters {selectedDepartment !== 'all' && '(1)'}
      </button>
    </div>
  );
} 