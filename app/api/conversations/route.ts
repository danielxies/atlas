import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';

// Add this log right at the top level of the module to check env var on load
console.log('[API /conversations] CLERK_SECRET_KEY defined:', !!process.env.CLERK_SECRET_KEY);

export async function GET(request: Request) {
  console.log('[API /conversations GET] Fetching currentUser');
  const user = await currentUser();
  console.log('[API /conversations GET] currentUser() result:', user ? `Found: ${user.id}` : 'Not found');
  
  if (!user) {
    console.error('[API /conversations GET] Unauthorized - no user found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createClient();
  try {
    console.log('[API /conversations GET] Fetching conversations for user:', user.id);
    const { data, error } = await supabase
      .from('conversations')
      .select('id, name, updated_at')
      .eq('clerk_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching conversations:', error);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('[API /conversations POST] Fetching currentUser');
  const user = await currentUser();
  console.log('[API /conversations POST] currentUser() result:', user ? `Found: ${user.id}` : 'Not found');
  
  if (!user) {
    console.error('[API /conversations POST] Unauthorized - no user found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createClient();
  try {
    // Create a unique name based on username and timestamp
    const firstName = user.firstName || 'User';
    const timestamp = Date.now();
    const uniqueName = `${firstName}-Chat-${timestamp}`;
    
    console.log('[API /conversations POST] Creating conversation for user:', user.id, 'with name:', uniqueName);
    
    // Create a new conversation with default values
    const newConversation = {
      clerk_id: user.id,
      name: uniqueName, // Use the unique name
      messages: [], // Start with an empty messages array
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert(newConversation)
      .select('id, name, updated_at, messages') // Return the newly created conversation
      .single(); // Expecting a single row back

    if (error) {
      console.error('[API /conversations POST] Supabase insert error:', error);
      throw error;
    }

    if (!data) {
      console.error('[API /conversations POST] Supabase insert did not return data.');
      throw new Error('Conversation creation did not return data.');
    }

    console.log('[API /conversations POST] Conversation created successfully:', data.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /conversations POST] Error caught in POST handler:', error.message);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
} 