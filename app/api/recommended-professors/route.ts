import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { NextResponse, NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Fetch profile using the user_id.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile Error:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse applied professor emails.
    let appliedEmails: string[] = [];
    if (profile.applied_professors) {
      if (Array.isArray(profile.applied_professors)) {
        appliedEmails = profile.applied_professors.map((s: string) => s.split("|")[2]?.toLowerCase() || "");
      } else if (typeof profile.applied_professors === "string") {
        try {
          const arr = JSON.parse(profile.applied_professors);
          if (Array.isArray(arr)) {
            appliedEmails = arr.map((s: string) => s.split("|")[2]?.toLowerCase() || "");
          }
        } catch (error) {
          console.error("Error parsing applied_professors:", error);
        }
      }
    }

    // Combine profile info into a single string.
    const userInfoText = `
Research Interests: ${profile.research_interests || ""}
Bio: ${profile.bio || ""}
Research Description: ${profile.research_description || ""}
Skills: ${profile.skills || ""}
Major: ${profile.major || ""}
Resume: ${profile.resume_text || ""}
    `.trim();

    if (!userInfoText) {
      return NextResponse.json({ error: "No profile information available for embedding." }, { status: 400 });
    }

    // Get embedding from OpenAI
    const embeddingResponse = await openai.embeddings.create({
      input: [userInfoText],
      model: "text-embedding-ada-002",
    });
    const userEmbedding = embeddingResponse.data[0].embedding;

    // ✅ Use the new advanced RPC to handle filtering inside the database
    const { data: professors, error: rpcError } = await supabase.rpc("match_professors_advanced", {
      vector_query: userEmbedding,
      applied_emails: appliedEmails,
      match_limit: 50, // query more to allow for filtering + deduplication
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    // ✅ Deduplicate by email in case of redundant entries
    const uniqueProfessorsMap = new Map<string, any>();
    for (const prof of professors as any[]) {
      if (prof.email) {
        const emailKey = prof.email.toLowerCase();
        if (!uniqueProfessorsMap.has(emailKey)) {
          uniqueProfessorsMap.set(emailKey, prof);
        }
      } else {
        uniqueProfessorsMap.set(Math.random().toString(), prof);
      }
    }

    const uniqueProfessors = Array.from(uniqueProfessorsMap.values()).slice(0, 10);

    // ✅ Return final cleaned-up results
    return NextResponse.json({
      professors: uniqueProfessors.map((prof) => ({
        name: prof.name,
        email: prof.email,
        department: prof.department,
        research_areas: prof.research_areas,
        preferred_majors: prof.preferred_majors,
        research_description: prof.research_description,
        profile_link: prof.profile_link,
        research_subdomain: prof.research_subdomain,
        currently_looking_for: prof.currently_looking_for,
      })),
    });
  } catch (err: any) {
    console.error("Unhandled Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
