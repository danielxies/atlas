// app/api/autofill-profile/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function scrapeText(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    return $("body").text().replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const {
    linkedinUrl = "",
    githubUrl = "",
    portfolioUrl = "",
    university = "",
    major = "",
  } = await req.json();

  // If no URLs provided, return full shape with empty other fields
  if (!linkedinUrl && !githubUrl && !portfolioUrl) {
    return NextResponse.json({
      university,
      major,
      linkedinUrl: "",
      portfolioUrl: "",
      githubUrl: "",
      otherLinks: [] as string[],
      summaryOfResearchExperience: "",
      researchInterests: [] as string[],
      skills: [] as string[],
    });
  }

  // build list of provided links...
  const links: { label: string; url: string }[] = [];
  if (linkedinUrl) links.push({ label: "LinkedIn", url: linkedinUrl });
  if (githubUrl)   links.push({ label: "GitHub",  url: githubUrl   });
  if (portfolioUrl)links.push({ label: "Portfolio", url: portfolioUrl });

  // scrape them in parallel (limit to 4k chars per scrape)
  const scraped = await Promise.all(
    links.map(async ({ label, url }) => {
      const text = await scrapeText(url);
      return `— ${label} (${url}):\n${text.slice(0, 4000)}`;
    })
  );

  // build GPT prompt
  const systemPrompt = `
You are an expert assistant that fills out a student profile from raw text.
Extract exactly the following JSON, no extra keys:

{
  "university": string,
  "major": string,
  "linkedinUrl": string,
  "portfolioUrl": string,
  "githubUrl": string,
  "otherLinks": string[],
  "summaryOfResearchExperience": string,
  "researchInterests": string[],
  "skills": string[]
  "scraped": string // scraped text provided
}
`.trim();

  const userPrompt = `
I have scraped the following data about a student:

${scraped.join("\n\n")}

University: ${university}
Major: ${major}

Please return *only* the JSON object described above, populating each URL field with the input URL (or empty string if none), and extracting arrays or summaries for the other fields.
`.trim();

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    temperature: 0.2,
    max_tokens: 800,
  });

  if (chat.choices.length === 0) {
    console.error("No choices returned from OpenAI");
    return NextResponse.json(
      { error: "No choices returned from OpenAI" },
      { status: 500 }
    );
  }

  let assistant = chat.choices[0].message.content.trim()
    .replace(/^```json/, "")
    .replace(/```$/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(assistant);
  } catch (e) {
    console.error("Failed to parse JSON:", assistant);
    return NextResponse.json(
      { error: "AI did not return valid JSON", detail: assistant },
      { status: 500 }
    );
  }

  return NextResponse.json(parsed);
}
