export interface ResearchProgram {
  id: string;
  title: string;
  institution: string;
  deadline: string;
  thumbnailUrl: string;
  description?: string;
  location?: string;
  duration?: string;
  eligibility?: string;
  funding?: string;
  applicationUrl?: string;
  department?: string;
  tags?: string[];
}

export interface ResearchProject {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  professorName?: string;
  department?: string;
  description?: string;
  skills?: string[];
  tags?: string[];
}

export interface LastMinuteOpportunity {
  id: string;
  title: string;
  institution: string;
  department: string;
  deadline: string;
  description: string;
  location: string;
  duration: string;
  eligibility: string;
  funding: string;
  applicationUrl: string;
  majors?: string[];
  tags?: string[];
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  type: string;
}

export type OpportunityType = ResearchProgram | ResearchProject | LastMinuteOpportunity; 