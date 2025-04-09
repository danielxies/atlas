import React from 'react';

interface FooterProps {
  isDark: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDark }) => {
  return (
    <footer className={`py-8 px-6 mt-auto ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e6d9]'}`}>
      <div className="max-w-7xl mx-auto text-center">
        <p className={`font-vastago ${isDark ? 'text-[#d1cfbf]' : 'text-gray-700'}`}>
          © Atlas 2025
        </p>
      </div>
    </footer>
  );
};

export default Footer; 