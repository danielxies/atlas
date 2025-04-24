// app/api/supabase-search/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);
const openai  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*
Test this endpoint with:
first run "npm run dev" to start the server
curl -X POST http://localhost:3000/api/supabase-search \
  -H "Content-Type: application/json" \
  -d '{"query": "query here"}' \
  | jq -r '.output'
*/

/*
Assumption: In Supabase you have created a stored function called `match_professors` that accepts:
  - vector_query (vector)
  - match_limit (int)
and returns rows from your `professors` table ordered by closeness of their embedding.
For example, in Supabase SQL Editor you can run:
--------------------------------------------------------
create or replace function match_professors(vector_query vector, match_limit int)
returns setof professors as $$
  select *, embedding <-> vector_query as distance
  from professors
  order by embedding <-> vector_query
  limit match_limit;
$$ language sql;
--------------------------------------------------------
*/

export async function POST(req: Request) {
  try {
    const { query, context = "" } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    // 1️⃣ Always embed + fetch top 5 professors
    const embedRes = await openai.embeddings.create({
      input: [query],
      model: "text-embedding-ada-002",
    });
    const vector_query = embedRes.data[0].embedding;

    const { data: profRows, error: profErr } = await supabase
      .rpc("match_professors", { vector_query, match_limit: 5 });

    if (profErr) throw profErr;
    const professors = (profRows as any[]).map(({ embedding, distance, ...p }) => p);

    // 2️⃣ Build a markdown‐friendly bullet list of profs
    const profList = professors.map((p, i) => `Professor ${i + 1}
- **Name:** ${p.name}
- **Department:** ${p.department}
- **Research Areas:** ${Array.isArray(p.research_areas) ? p.research_areas.join(", ") : p.research_areas}
- **Preferred Majors:** ${Array.isArray(p.preferred_majors) ? p.preferred_majors.join(", ") : p.preferred_majors}
- **Description:** ${p.research_description}
- **Profile:** ${p.profile_link}`
    ).join("\n\n");

    // 3️⃣ Always call GPT with both context + the new profList
    const systemMsg = {
      role: "system" as const,
      content: `
    You are a friendly research advisor.
    You’ve been given a list of professors and a question from a student. If you believe the user's question can be answered fully using the running conversation, do so without introducing new information.
    
    However, if you choose to include professors, follow this exact format:
    
    • Start with a short greeting that acknowledges the user's interest.  
    • Dedicate one paragraph to each professor you want to highlight (3–5 total).  
       – **Bold the professor's name the first time it appears** in that paragraph.  
       – Explain in 1–2 sentences why their research aligns with the user's query.  
    • Add this text "__" after each paragraph so they appear as separate paragraphs in markdown.
    
    Never mention professors not explicitly provided in the list.
    `.trim()
    };
    
    const userMsg = {
      role: "user" as const,
      content: `
    Here is the previous conversation context (you may use it):
    ${context || "_<no prior context>_"}
    
    Here are five professors you may choose to highlight:
    ${profList}
    
    The user now asks:
    "${query}"
    
    Respond in conversational markdown.
    `.trim()
    };
    

    const chat = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [systemMsg, userMsg],
      max_tokens: 1200,
      temperature: 0.25,
    });

    return NextResponse.json({
      output: chat.choices[0].message.content,
      professors
    });
  } catch (err: any) {
    console.error("Error in /api/supabase-search:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
