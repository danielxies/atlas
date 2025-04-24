// app/api/chat-conversations/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase   = createClient(supabaseUrl, supabaseKey)

type ConversationInsert = {
    clerk_id: string;
    name:     string;
    messages: unknown;    // “unknown” lets you pass an array of {role,content}
  };

/**
 * POST /api/chat-conversations
 * Upsert (insert or replace) a conversation scoped to a given clerk_id + name.
 */
export async function POST(request: NextRequest) {
  try {
    const { clerk_id, name, messages } = await request.json()

    // Basic validation
    if (
      typeof clerk_id !== 'string' ||
      typeof name      !== 'string' ||
      !Array.isArray(messages)
    ) {
      return NextResponse.json(
        { error: 'Invalid body: clerk_id (string), name (string), messages (array) are required.' },
        { status: 400 }
      )
    }

    // Upsert conversation
    const { data, error } = await supabase
      .from('conversations')
      .upsert(
        { clerk_id, name, messages },
        { onConflict: 'clerk_id,name' }
      )
      .select('*')
      .single()

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversation: data![0] }, { status: 200 })
  } catch (err: any) {
    console.error('POST /chat-conversations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
/*
Valid Input Json:
{
  "clerk_id": "string",       // the user's Clerk ID
  "name":     "string",       // unique conversation name for this user
  "messages": [               // array of message objects
    { "role": "user",      "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" }
  ]
}

Intended Output Json:
{
  "conversation": {
    "id":         "uuid",
    "clerk_id":   "string",
    "name":       "string",
    "messages":   [ //array of message objects],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}

Example Input Json:
{
  "id": "c3a9c94d-3f4a-4a6d-9308-2b21e0e4a404",     // auto-generated UUID
  "clerk_id": "user_2v9nY5i7JK3dBesAyWD89JcXgEZ",   // Clerk user ID (text)
  "name": "Introduction to AI Chat",                // Custom user-defined name
  "messages": [
    {
      "role": "user",
      "content": "What is artificial intelligence?"
    },
    {
      "role": "assistant",
      "content": "Artificial intelligence is the simulation of human intelligence in machines."
    },
    {
      "role": "user",
      "content": "Can you give an example?"
    },
    {
      "role": "assistant",
      "content": "Sure! An example of AI is a chatbot that can answer questions or assist users, like me."
    }
  ],
  "created_at": "2025-04-19T21:00:00.000Z",          // Supabase-generated timestamp
  "updated_at": "2025-04-19T21:10:00.000Z"           // Auto-updated timestamp
}
*/


/**
 * GET /api/chat-conversations?clerk_id=…&name=…
 * Retrieve a single conversation by clerk_id + name.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clerk_id = searchParams.get('clerk_id')
    const name     = searchParams.get('name')

    if (!clerk_id || !name) {
      return NextResponse.json(
        { error: 'Missing query params: clerk_id and name are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('clerk_id', clerk_id)
      .eq('name', name)
      .single()

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 })
      }
      console.error('Supabase select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversation: data }, { status: 200 })
  } catch (err: any) {
    console.error('GET /chat-conversations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
/*
Valid Input Query Params:
{
  "clerk_id": "string", // the user's Clerk ID
  "name":     "string"  // unique conversation name for this user
}
Intended Output Json:
{       
  "conversation": {
    "id":         "uuid",
    "clerk_id":   "string",
    "name":       "string",
    "messages":   [ //array of message objects],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
*/
