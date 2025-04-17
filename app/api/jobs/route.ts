import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Define the Job type
export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  logo?: string;
  tags: string[];
  description?: string;
  applicants?: string;
  requirements?: string[];
  created_at?: string;
};

// GET endpoint to fetch all jobs
export async function GET(request: Request) {
  try {
    // Fetch jobs from Supabase
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job data' },
        { status: 500 }
      );
    }

    // If no jobs are found in Supabase, return mock data for development
    if (!jobs || jobs.length === 0) {
      // Mock data for development
      const mockJobs: Job[] = [
        {
          id: '1',
          title: "Summer 2025 Technology Intern",
          company: "Forbes",
          location: "United States (Remote)",
          logo: "",
          tags: ["Technology", "Internship"]
        },
        {
          id: '2',
          title: "Machine Learning Engineer Intern",
          company: "Moloco",
          location: "United States (Remote)",
          salary: "$9,600/month - $11.5K/month",
          logo: "",
          tags: ["Machine Learning", "AWS"]
        },
        {
          id: '3',
          title: "Software Engineering Intern, Summer 2025",
          company: "Acorns",
          location: "United States (Remote)",
          salary: "$25/hr",
          logo: "",
          tags: ["Software Engineering"]
        },
        {
          id: '4',
          title: "Summer Internship 2025 - AI Solutions",
          company: "TradeStation",
          location: "United States (Remote)",
          logo: "",
          tags: ["AI", "Technology"],
          description: "Join our team to work on cutting-edge AI solutions for the financial industry. You'll be working with experienced engineers and data scientists to develop and implement machine learning models that help traders make better decisions.",
          applicants: "Be one of the first 10 applicants"
        }
      ];
      return NextResponse.json(mockJobs);
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job data' },
      { status: 500 }
    );
  }
} 