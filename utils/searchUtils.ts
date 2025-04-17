import { Professor } from '@/components/custom/ProfessorCard';

export function calculateSimilarity(searchText: string, professor: Professor): number {
  const searchLower = searchText.toLowerCase().trim();
  if (!searchLower) return 0;
  const searchTerms = searchLower.split(' ').filter(term => term.length >= 2);
  if (searchTerms.length === 0) return 0;
  let score = 0;
  for (const term of searchTerms) {
    if (professor.name.toLowerCase().includes(term)) score += 5;
    if (professor.department.toLowerCase().includes(term)) score += 4;
    if (professor.email.toLowerCase().includes(term)) score += 4;
    if (professor.research_areas.some(area => area.toLowerCase().includes(term))) score += 3;
    if (professor.preferred_majors.some(major => major.toLowerCase().includes(term))) score += 3;
    if (professor.research_description.toLowerCase().includes(term)) score += 2;
    if (professor.cs_subdomain.toLowerCase().includes(term)) score += 2;
    if (professor.currently_looking_for.toLowerCase().includes(term)) score += 1;
  }
  if (professor.name.toLowerCase() === searchLower) score += 3;
  if (professor.department.toLowerCase() === searchLower) score += 2;
  if (professor.email.toLowerCase() === searchLower) score += 2;
  if (professor.research_areas.some(area => area.toLowerCase() === searchLower)) score += 2;
  if (professor.preferred_majors.some(major => major.toLowerCase() === searchLower)) score += 2;
  return score;
} 