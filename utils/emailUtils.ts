import { Professor } from '@/components/custom/ProfessorCard';
import { supabase } from '@/lib/supabase';

type UserDetails = {
  id: string;
  fullName: string | null;
  researchInterests: string[];
  experience: string;
  skills: string[];
  resumeUrl: string;
  linkedin: string;
  github: string;
  otherLinks: string[];
  university: string;
  major: string;
};

export async function updateAppliedProfessors(userId: string, professor: Professor) {
  try {
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('applied_professors')
      .eq('clerk_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching applied_professors:', fetchError);
      return false;
    }
    
    let appliedList = profileData.applied_professors || [];

    // Normalize to array
    if (!Array.isArray(appliedList)) {
      appliedList = appliedList
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s);
    }

    const nameParts = professor.name.split(' ');
    const professorEntry = `${nameParts[0]}|${nameParts[nameParts.length - 1]}|${professor.email}`;

    // Only add if not already applied
    if (!appliedList.includes(professorEntry)) {
      appliedList.push(professorEntry);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ applied_professors: appliedList })
        .eq('clerk_id', userId);
        
      if (updateError) {
        console.error('Error updating applied_professors:', updateError);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error updating applied_professors:', err);
    return false;
  }
}

export async function generateEmailDraft(professor: Professor, user: UserDetails) {
  const nameParts = professor.name.split(' ');
  const professorForEmail = {
    lastName: nameParts[nameParts.length - 1],
    researchArea: professor.research_areas[0] || "the subject area",
    researchDescription: professor.research_description || "the research description"
  };

  const userDetails = {
    name: user.fullName || "Your Name",
    researchInterests: user.researchInterests,
    experience: user.experience,
    skills: user.skills,
    resumeUrl: user.resumeUrl,
    linkedin: user.linkedin,
    github: user.github,
    otherLinks: user.otherLinks,
    university: user.university,
    major: user.major,
  };

  try {
    const res = await fetch('/api/generate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        professor: professorForEmail,
        user: userDetails,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error('Failed to generate email: ' + data.error);
    }

    const data = await res.json();
    return data.email;
  } catch (err) {
    console.error('Error generating email draft:', err);
    throw err;
  }
}

export function createMailtoLink(email: string, draftEmail: string) {
  // Split off the Subject: line
  const lines = draftEmail.split('\n');
  let subject = '';
  let body = '';
  let seenSubject = false;

  for (const line of lines) {
    if (!seenSubject && line.toLowerCase().startsWith('subject:')) {
      subject = line.replace(/^[sS]ubject:/, '').trim();
      seenSubject = true;
    } else if (seenSubject) {
      body += line + '\n';
    }
  }

  // Fallback if no explicit Subject: line
  if (!subject) {
    subject = `Inquiry about research opportunities`;
    body = draftEmail;
  }

  return `mailto:${email}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
} 