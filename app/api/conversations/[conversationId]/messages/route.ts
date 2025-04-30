import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';

// Interface for the message structure expected in the JSONB array
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Assuming ISO string format
}

// GET specific conversation's messages
export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  console.log('[API /conversations/messages GET] Fetching currentUser');
  const user = await currentUser();
  console.log('[API /conversations/messages GET] currentUser result:', user ? `Found: ${user?.id}` : 'Not found');
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversationId = params.conversationId;
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversation ID' }, { status: 400 });
  }

  const supabase = createClient();

  try {
    console.log('[API /conversations/messages GET] Fetching messages for conversation:', conversationId, 'user:', user.id);
    const { data, error } = await supabase
      .from('conversations')
      .select('messages')
      .eq('id', conversationId)
      .eq('clerk_id', user.id) // Ensure user owns the conversation
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Case where conversation not found or doesn't belong to user
        console.error('[API /conversations/messages GET] Conversation not found or access denied:', error);
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      console.error('[API /conversations/messages GET] Supabase error fetching messages:', error);
      throw error;
    }

    if (!data) {
      console.error('[API /conversations/messages GET] No data returned for conversation:', conversationId);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    console.log('[API /conversations/messages GET] Successfully fetched messages, count:', (data.messages?.length || 0));
    return NextResponse.json(data.messages || []); // Return the messages array
  } catch (error) {
    console.error('[API /conversations/messages GET] Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST a new message to a conversation
export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  console.log('[API /conversations/messages POST] Fetching currentUser');
  const user = await currentUser();
  console.log('[API /conversations/messages POST] currentUser result:', user ? `Found: ${user?.id}` : 'Not found');
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversationId = params.conversationId;
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversation ID' }, { status: 400 });
  }

  let newMessage: Message;
  try {
    newMessage = await request.json();
    // Basic validation
    if (!newMessage || !newMessage.role || !newMessage.content) {
      throw new Error('Invalid message format');
    }
    // Add timestamp if missing (though frontend should provide it)
    if (!newMessage.timestamp) {
        newMessage.timestamp = new Date().toISOString();
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = createClient();

  try {
    console.log('[API /conversations/messages POST] Adding message to conversation:', conversationId);
    // Fetch current messages
    const { data: currentData, error: fetchError } = await supabase
      .from('conversations')
      .select('messages')
      .eq('id', conversationId)
      .eq('clerk_id', user.id) // Ensure user owns the conversation
      .single();

    if (fetchError || !currentData) {
      if (fetchError?.code === 'PGRST116') {
        console.error('[API /conversations/messages POST] Conversation not found or access denied:', fetchError);
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      console.error('[API /conversations/messages POST] Supabase error fetching conversation before update:', fetchError);
      throw fetchError || new Error('Conversation not found');
    }

    const currentMessages = (currentData.messages || []) as Message[];
    const updatedMessages = [...currentMessages, newMessage];

    // Update the conversation with the new messages array and touch updated_at
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString(), // Manually update timestamp
      })
      .eq('id', conversationId)
      .eq('clerk_id', user.id);

    if (updateError) {
      console.error('[API /conversations/messages POST] Supabase error updating messages:', updateError);
      throw updateError;
    }

    console.log('[API /conversations/messages POST] Successfully added message to conversation:', conversationId);
    return NextResponse.json({ success: true, message: newMessage }); // Return the added message

  } catch (error) {
    console.error('[API /conversations/messages POST] Error adding message:', error);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
} 