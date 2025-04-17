import React from 'react';

type FilterModalProps = {
  isDark: boolean;
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
  selectedDepartment: string;
  handleDepartmentChange: (department: string) => void;
};

export default function FilterModal({
  isDark,
  showFilterModal,
  setShowFilterModal,
  selectedDepartment,
  handleDepartmentChange
}: FilterModalProps) {
  if (!showFilterModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`${isDark ? 'bg-[#2a2a2a] text-[#d1cfbf]' : 'bg-white text-gray-800'} rounded-lg shadow-xl p-6 w-full max-w-md`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-alice`}>
            Filter Options
          </h3>
          <button 
            onClick={() => setShowFilterModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Department Filter */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'} mb-1`}>
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className={`w-full p-2 rounded-md border ${
                isDark ? 'bg-[#333] border-gray-700 text-[#d1cfbf]' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-claude-orange focus:border-transparent`}
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          {/* Subject/Research Area Tags (for future implementation) */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'} mb-1`}>
              Research Areas
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'Machine Learning', 
                'AI', 
                'Data Science', 
                'Bioinformatics',
                'Quantum Computing'
              ].map(area => (
                <button 
                  key={area}
                  // onClick to be implemented for multiple filter selection
                  className={`px-3 py-1 text-sm rounded-full border ${
                    isDark 
                      ? 'border-gray-700 bg-[#333] text-[#d1cfbf] hover:bg-[#444]' 
                      : 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Looking For (Student Level) */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-[#d1cfbf]/90' : 'text-gray-700'} mb-1`}>
              Looking For
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'Undergrad', 
                'Masters', 
                'PhD',
                'Post-doc'
              ].map(level => (
                <button 
                  key={level}
                  // onClick to be implemented for multiple filter selection
                  className={`px-3 py-1 text-sm rounded-full border ${
                    isDark 
                      ? 'border-gray-700 bg-[#333] text-[#d1cfbf] hover:bg-[#444]' 
                      : 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => {
                handleDepartmentChange('all');
                setShowFilterModal(false);
              }}
              className={`px-4 py-2 rounded-md ${
                isDark 
                  ? 'bg-[#3a3a3a] text-[#d1cfbf] hover:bg-[#444]' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className={`px-4 py-2 rounded-md ${
                isDark 
                  ? 'bg-claude-orange text-[#1a1a1a]' 
                  : 'bg-claude-orange text-white'
              } hover:opacity-90`}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 