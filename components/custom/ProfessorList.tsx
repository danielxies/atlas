import React from 'react';
import ProfessorCard, { Professor } from './ProfessorCard';

type ProfessorListProps = {
  filteredProfessors: Professor[];
  isDataLoading: boolean;
  openModal: (professor: Professor) => void;
  isDark: boolean;
};

export default function ProfessorList({
  filteredProfessors,
  isDataLoading,
  openModal,
  isDark
}: ProfessorListProps) {
  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-claude-orange' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProfessors.map((professor) => (
        <ProfessorCard
          key={professor.profile_link}
          professor={professor}
          onClick={() => openModal(professor)}
          isDark={isDark}
        />
      ))}
    </div>
  );
} 