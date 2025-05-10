// ── app/api/supabase-search/route.ts ──────────────────────────────
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
    const { query, context = "", needProfessors = true } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    /* ------------------------------------------------------------ *
       1 ▼  If this is a FOLLOW‑UP (needProfessors === false)
           just let GPT answer from the running context. No DB call.
     * ------------------------------------------------------------ */
    if (!needProfessors) {
      const prompt = `
You are still acting as a friendly Purdue research‑advisor.

Conversation so far:
${context}

The user now asks:
"${query}"

Answer conversationally in markdown using only the information already
discussed. **Do not introduce or invent new professors.**
      `.trim();

      const chat = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system",
            content: "You are a helpful research‑advisor that continues the conversation." },
          { role: "user", content: prompt },
        ],
        max_tokens: 900,
        temperature: 0.3,
      });

      return NextResponse.json({ output: chat.choices[0].message.content });
    }

    /* ------------------------------------------------------------ *
       2 ▼  FIRST prompt of a conversation → fetch 5 matching profs
     * ------------------------------------------------------------ */
    const embed = await openai.embeddings.create({
      input: [query],
      model: "text-embedding-ada-002",
    });
    const queryEmbedding = embed.data[0].embedding;

    const { data, error } = await supabase.rpc("match_professors", {
      vector_query: queryEmbedding,
      match_limit : 5,
    });
    if (error) throw error;

    const profs = (data as any[]).map(({ embedding, distance, ...p }) => p);

    /* build professor bullet list & table … exactly as before */
    const bullets = profs.map(
      (p, i) => `Professor ${i + 1}
- **Name:** ${p.name}
- **Department:** ${p.department}
- **Research Areas:** ${Array.isArray(p.research_areas) ? p.research_areas.join(", ") : p.research_areas}
- **Preferred Majors:** ${Array.isArray(p.preferred_majors) ? p.preferred_majors.join(", ") : p.preferred_majors}
- **Description:** ${p.research_description}
- **Profile:** ${p.profile_link}`
    ).join("\n\n");

    const table = [
      "| Name | Department | Research Areas | Preferred Majors | Profile Link |",
      "| --- | --- | --- | --- | --- |",
      ...profs.map(
        p => `| ${p.name} | ${p.department} | ${
          Array.isArray(p.research_areas) ? p.research_areas.join(", ") : p.research_areas
        } | ${
          Array.isArray(p.preferred_majors) ? p.preferred_majors.join(", ") : p.preferred_majors
        } | ${p.profile_link} |`
      ),
    ].join("\n");

    const firstPrompt = `
You are a friendly and knowledgeable Purdue research‑advisor.

The user asks:
"${query}"

Here are five matching professors:

${bullets}

Write a conversational answer in markdown:

• Start with a short greeting that acknowledges the user's interest.  
• Dedicate one paragraph to each professor you want to highlight (3–5 total).  
  – **Bold the professor's name the first time it appears** in that paragraph.  
  – Explain in 1–2 sentences why their research aligns with the user's query.  
• Add this text "__" after each paragraph on a new line so they appear as separate paragraphs in markdown.
    `.trim();

    const chat = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system",
          content: "You are a helpful research‑advisor that suggests professors." },
        { role: "user", content: firstPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.25,
    });

    return NextResponse.json({ output: chat.choices[0].message.content, professors: profs });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
