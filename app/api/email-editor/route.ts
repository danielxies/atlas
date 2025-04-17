// app/api/email-editor/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { current_text, prompt, context } = await req.json();
    if (!current_text || !prompt) {
      return NextResponse.json({ error: 'Missing current_text or prompt' }, { status: 400 });
    }

    const systemContent = `You are an assistant that edits email drafts${context ? ' with this context:\n' + context : ''}. Do not return any other text except the actual email format itself`;
    const userContent = `Here is the draft:\n${current_text}\n\nInstruction: ${prompt}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent }
      ],
      max_tokens: 600,
      temperature: 0.2,
    });

    return NextResponse.json({ updated_text: completion.choices[0].message.content });
  } catch (e: any) {
    console.error('Email-editor error:', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
