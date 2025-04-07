import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Require node-compatible build
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.js');

export async function POST(request: Request) {
  try {
    const { url, clerk_id } = await request.json();
    if (!url || !clerk_id) {
      return NextResponse.json({ error: 'Missing URL or Clerk ID' }, { status: 400 });
    }

    console.log('Fetching resume from:', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed to fetch PDF:', res.statusText);
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let extractedText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      extractedText += pageText + '\n';
    }

    console.log('Text extracted, characters:', extractedText.length);

    // Save first 10,000 characters to Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ resume_text: extractedText.slice(0, 10000) })
      .eq('clerk_id', clerk_id);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Resume text successfully saved to DB');
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Unhandled error in parse-resume:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
