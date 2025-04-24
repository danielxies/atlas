import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { OpenAI } from 'openai';
import { load } from 'cheerio';

/*
Sample Input JSON:
curl -X POST http://localhost:3000/api/onboarding-completion \
  -H "Content-Type: application/json" \
  -d '{
    "university": "Purdue University",
    "major": "Computer Science",
    "linkedin_url": "https://www.linkedin.com/in/monish-muralicharan/",
    "github_url": "https://github.com/monishmuralicharan",
    "portfolio_url": "https://scholar.google.com/citations?user=ayWYo0MAAAAJ&hl=en"
  }' | jq
*/


/**
 * Request payload schema
 */
interface ProfileRequest {
  university: string;
  major: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  other_links?: string[];
}

/**
 * Response payload schema
 */
interface ProfileResponse {
  university: string;
  major: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  other_links: string[];
  summary_of_research_experience: string | null;
  research_interests: string[];
  skills: string[];
}

// Initialize OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error('Missing OPENAI_API_KEY');
}
const openai = new OpenAI({ apiKey: openaiApiKey });

// Initialize GitHub client (unauthenticated)
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

/**
 * Scrape public LinkedIn profile data (name, headline, summary)
 */
async function scrapeLinkedIn(url: string): Promise<Record<string, any>> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return {};
    const html = await res.text();
    const $ = load(html);
    const data: Record<string, any> = {};
    const name = $('h1').first().text().trim();
    if (name) data.name = name;
    const headline = $('h2').first().text().trim();
    if (headline) data.headline = headline;
    const about = $('section[id*=about]').text().trim();
    if (about) data.summary = about;
    return data;
  } catch {
    return {};
  }
}

/**
 * Use GitHub REST API to fetch user info, repos, languages
 */
async function scrapeGitHub(url: string): Promise<Record<string, any>> {
  const match = url.match(/github\.com\/([^\/]+)/);
  if (!match) return {};
  const username = match[1];
  try {
    const { data: user } = await octokit.users.getByUsername({ username });
    const result: Record<string, any> = {};
    if (user.name) result.name = user.name;
    if (user.bio) result.bio = user.bio;

    const { data: repos } = await octokit.repos.listForUser({ username, per_page: 50 });
    const langCount: Record<string, number> = {};
    repos.forEach(repo => {
      const lang = repo.language || 'Unknown';
      langCount[lang] = (langCount[lang] || 0) + 1;
    });
    result.languages = Object.entries(langCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang]) => lang);

    result.projects = repos
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 5)
      .map(repo => ({
        name: repo.name,
        description: repo.description ?? '',
        stars: repo.stargazers_count ?? 0,
        link: repo.html_url
      }));

    return result;
  } catch {
    return {};
  }
}

/**
 * Generic portfolio scraper: title, meta description, headings, simple projects list
 */
async function scrapePortfolio(url: string): Promise<Record<string, any>> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return {};
    const html = await res.text();
    const $ = load(html);
    const data: Record<string, any> = {};

    const title = $('title').text().trim();
    if (title) data.title = title;
    const metaDesc = $('meta[name="description"]').attr('content');
    if (metaDesc) data.description = metaDesc.trim();

    const h1 = $('h1').first().text().trim();
    if (h1) data.h1 = h1;

    // Collect lists under headings containing 'project'
    const projects: string[] = [];
    $('h2, h3').each((_, el) => {
      const headingText = $(el).text().toLowerCase();
      if (headingText.includes('project')) {
        $(el)
          .next('ul')
          .find('li')
          .each((_, li) => projects.push($(li).text().trim()));
      }
    });
    if (projects.length) data.projects_list = projects;

    return data;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const req: ProfileRequest = await request.json();
  const {
    university,
    major,
    linkedin_url,
    github_url,
    portfolio_url,
    other_links = []
  } = req;

  if (!linkedin_url && !github_url && !portfolio_url && other_links.length === 0) {
    const empty: ProfileResponse = {
      university,
      major,
      linkedin_url: null,
      portfolio_url: null,
      github_url: null,
      other_links: [],
      summary_of_research_experience: null,
      research_interests: [],
      skills: []
    };
    return NextResponse.json(empty);
  }

  const tasks: Promise<Record<string, any>>[] = [];
  if (linkedin_url) tasks.push(scrapeLinkedIn(linkedin_url));
  if (github_url) tasks.push(scrapeGitHub(github_url));
  if (portfolio_url) tasks.push(scrapePortfolio(portfolio_url));
  const results = await Promise.all(tasks.map(p => p.catch(() => ({}))));

  const scrapedData = results.reduce((acc, cur) => ({ ...acc, ...cur }), {});

  // Call OpenAI and capture raw output for debugging
  const messages = [
    {
      role: 'system',
      content: 'You are a strict JSON generator. Return only valid JSON matching this exact format without any extra text or comments: {"university":"Purdue University","major":"Computer Science","linkedin_url":null,"portfolio_url":null,"github_url":null,"other_links":[],"summary_of_research_experience":null,"research_interests":[],"skills":[]}.'
    },
    {
      role: 'system',
      content: 'Do not include any additional keys or explanatory text. Only output the JSON object. Use the scraped data to populate fields, and if it contains experience or education details, generate a concise "summary_of_research_experience" based on that information.'
    },
    {
      role: 'user',
      content: `You are a profile builder. Given the following input and scraped data:
University: ${university}
Major: ${major}
LinkedIn URL: ${linkedin_url}
GitHub URL: ${github_url}
Portfolio URL: ${portfolio_url}
Other Links: ${other_links.join(', ')}
Scraped Data (JSON): ${JSON.stringify(scrapedData)}
Return a JSON object with these keys exactly: university, major, linkedin_url, portfolio_url, github_url, other_links, summary_of_research_experience, research_interests, skills. Fill missing values with null or empty arrays. Ensure you summarize research experience if available. Fill out the research_interests and skills fields to the best of your ability based on the scraped data.` 
    }
  ];

  const chat = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages,
    temperature: 0.2
  });
  const raw = chat.choices?.[0]?.message.content ?? '';

  // Attempt to extract JSON snippet
  let jsonText = raw;
  const fenceMatch = raw.match(/```json([\s\S]*?)```/i);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  } else {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      jsonText = raw.substring(start, end + 1);
    }
  }

  let profile: ProfileResponse;
  try {
    profile = JSON.parse(jsonText) as ProfileResponse;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON from OpenAI', raw, jsonText }, { status: 500 });
  }

  return NextResponse.json(profile);
}
