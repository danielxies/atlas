// app/api/recommended-professors/route.ts
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { getAuth } from '@clerk/nextjs/server';
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
      // Get current user ID from Clerk.
      const { userId } = getAuth(request);
      console.log("User ID:", userId);
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      // Fetch profile from Supabase.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("clerk_id", userId)
        .single();
      if (profileError || !profile) {
        console.error("Profile Error:", profileError);
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }
      console.log("Fetched Profile:", profile);
  
      // Process applied professors.
      let appliedEmails: string[] = [];
      if (profile.applied_professors) {
        if (Array.isArray(profile.applied_professors)) {
          appliedEmails = profile.applied_professors.map((s: string) => {
            const parts = s.split("|");
            return parts[2]?.toLowerCase() || "";
          });
        } else if (typeof profile.applied_professors === "string") {
          try {
            const arr = JSON.parse(profile.applied_professors);
            if (Array.isArray(arr)) {
              appliedEmails = arr.map((s: string) => {
                const parts = s.split("|");
                return parts[2]?.toLowerCase() || "";
              });
            }
          } catch (error) {
            console.error("Error parsing applied_professors:", error);
          }
        }
      }
      console.log("Applied emails:", appliedEmails);
  
      // Combine profile info into one text string.
      const userInfoText = `
  Research Interests: ${profile.research_interests || ""}
  Bio: ${profile.bio || ""}
  Research Description: ${profile.research_description || ""}
  Skills: ${profile.skills || ""}
  Major: ${profile.major || ""}
  Resume: ${profile.resume_text || ""}
      `;
      if (!userInfoText.trim()) {
        console.error("User info text is empty");
        return NextResponse.json({ error: "No profile information available for embedding." }, { status: 400 });
      }
      console.log("User Info Text:", userInfoText);
  
      // Create an embedding with OpenAI.
      const embeddingResponse = await openai.embeddings.create({
        input: [userInfoText],
        model: "text-embedding-ada-002",
      });
      const userEmbedding = embeddingResponse.data[0].embedding;
      console.log("User Embedding:", userEmbedding);
  
      // Call the Supabase RPC function.
      const { data: professors, error: rpcError } = await supabase.rpc("match_professors", {
        vector_query: userEmbedding,
        match_limit: 10,
      });
      if (rpcError) {
        console.error("RPC Error:", rpcError);
        return NextResponse.json({ error: rpcError.message }, { status: 500 });
      }
      console.log("Professors from RPC:", professors);
  
      // Filter out professors already applied to.
      const filteredProfessors = (professors as any[]).filter((prof) => {
        if (!prof.email) return true;
        return !appliedEmails.includes(prof.email.toLowerCase());
      });
      console.log("Filtered Professors:", filteredProfessors);
  
      // Return the result.
      return NextResponse.json({ professors: filteredProfessors });
    } catch (err: any) {
      console.error("Unhandled Error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  