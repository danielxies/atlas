// app/api/supabase-search/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    // Step 1: Convert the query to an embedding
    const embeddingResponse = await openai.embeddings.create({
      input: [query],
      model: "text-embedding-ada-002",
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 2: Use Supabase RPC to find the top 5 matching professors.
    const { data, error: rpcError } = await supabase.rpc("match_professors", { 
      vector_query: queryEmbedding,
      match_limit: 5
    });
    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    // Remove the embedding (and distance) from each professor's record for cleaner output.
    const matchedProfessors = (data as any[]).map((prof) => {
      const { embedding, distance, ...cleaned } = prof;
      return cleaned;
    });

    // Step 3: Build context text from the matched professors.
    let professorInfoText = "";
    for (const prof of matchedProfessors as any[]) {
      professorInfoText += `
Name: ${prof.name}
Department: ${prof.department}
Research Areas: ${Array.isArray(prof.research_areas) ? prof.research_areas.join(", ") : prof.research_areas}
Preferred Majors: ${Array.isArray(prof.preferred_majors) ? prof.preferred_majors.join(", ") : prof.preferred_majors}
Research Description: ${prof.research_description}
Profile Link: ${prof.profile_link}
`;
    }

    // Step 4: Construct the prompt for GPT-4.1-mini.
    const prompt = `
You are a friendly research advisor. A user has asked:
"${query}"

Below are 5 professor records from Purdue that are the best matches for this query:
${professorInfoText}

Using the above information, generate a conversational recommendation that suggests the top matches. In your answer, explain briefly why these professors are a good fit, and output the recommendations in a natural and engaging style without rigid formatting. Do not include extraneous formatting (like extra separators), just a natural explanation followed by the key details for each professor.
`;

    // Step 5: Get the final output from GPT-4.1-mini.
    const completionResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: "system", content: "You are an assistant that gives friendly, conversational recommendations based on research professor data." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1200,
      temperature: 0.2,
      top_p: 0.9,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const gptOutput = completionResponse.choices[0].message.content;

    // Step 5.1: Create a markdown table with basic professor information.
    const markdownTable = `
| Name | Department | Research Areas | Preferred Majors | Profile Link |
| --- | --- | --- | --- | --- |
${matchedProfessors.map(prof => 
  `| ${prof.name || ""} | ${prof.department || ""} | ${
    Array.isArray(prof.research_areas) ? prof.research_areas.join(", ") : (prof.research_areas || "")
  } | ${
    Array.isArray(prof.preferred_majors) ? prof.preferred_majors.join(", ") : (prof.preferred_majors || "")
  } | ${prof.profile_link || ""} |`
).join("\n")}
`;

    // Step 5.2: Append the markdown table to the GPT output.
    const finalOutput = gptOutput + "\n\n" + "### Professor Information\n" + markdownTable;

    // Step 6: Return the output (with markdown table) and a JSON of just the professor information.
    return NextResponse.json({ output: finalOutput, professors: matchedProfessors });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
