import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Define the Professor type
type Professor = {
  profile_link: string;
  name: string;
  email: string;
  department: string;
  classes_teaching: string[];
  research_description: string;
  research_areas: string[];
  preferred_majors: string[];
  currently_looking_for: string;
  cs_subdomain: string;
};

// Function to read and parse the CSV file
async function readProfessorData(): Promise<Professor[]> {
  console.log('getting prof data')
  try {
    const csvFilePath = path.join(process.cwd(), 'scripts', 'data', 'professors_dataset.csv');
    const csvFileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const { data, errors } = Papa.parse(csvFileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.toLowerCase().replace(/\s+/g, '_'),
    });

    if (errors.length > 0) {
      console.error('CSV parsing errors:', errors);
      throw new Error('Failed to parse CSV file');
    }
    else{
      console.log('csv parsing successful')
    }

    return data.map((row: any) => {
      const parseJSONArray = (value: string): string[] => {
        try {
          if (!value || value.trim() === '' || value === '[]') return [];
          const cleanValue = value.replace(/'/g, '"').replace(/\[|\]/g, '');
          return JSON.parse(`[${cleanValue}]`);
        } catch (e) {
          return value.split(',').map(item => item.trim().replace(/^['"]+|['"]+$/g, ''));
        }
      };

      const preferredMajors = parseJSONArray(row.preferred_majors);
      
      let out_email = row.email || '';
      const imgAltRegex = /<img[^>]*alt=(["'])(.*?)\1[^>]*>/i;
      const imgAltMatch = out_email.match(imgAltRegex);
      if (imgAltMatch && imgAltMatch[2]) {
        out_email = imgAltMatch[2];
      }
      out_email = out_email.replace(/_nospam|_nojunk/g, '');

      return {
        profile_link: row.profile_link || '',
        name: row.name || '',
        email: out_email || '',
        department: row.department || '',
        classes_teaching: parseJSONArray(row.classes_teaching),
        research_description: row.research_description || '',
        research_areas: parseJSONArray(row.research_areas),
        preferred_majors: preferredMajors,
        currently_looking_for: row.currently_looking_for || '',
        cs_subdomain: row.cs_subdomain || '',
      };
    });
  } catch (error) {
    console.error('Error reading professor data:', error);
    throw error;
  }
}

// GET endpoint to fetch all professors
export async function GET(request: Request) {
  try {
    // Removed authorization header check so that the data is public.
    const professors = await readProfessorData();
    return NextResponse.json(professors);
  } catch (error) {
    console.error('Error in GET /api/professors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professor data' },
      { status: 500 }
    );
  }
}
