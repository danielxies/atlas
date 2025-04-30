import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';

// DELETE a conversation
export async function DELETE(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  console.log('[API /conversations/[id] DELETE] Fetching currentUser');
  const user = await currentUser();
  console.log('[API /conversations/[id] DELETE] currentUser result:', user ? `Found: ${user?.id}` : 'Not found');
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversationId = params.conversationId;
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversation ID' }, { status: 400 });
  }

  const supabase = createClient();

  try {
    console.log('[API /conversations/[id] DELETE] Attempting to delete conversation:', conversationId);
    
    // First verify the user owns this conversation
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('clerk_id', user.id)
      .single();
      
    if (fetchError || !conversation) {
      console.error('[API /conversations/[id] DELETE] Conversation not found or access denied:', fetchError);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    // Delete the conversation
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('clerk_id', user.id);

    if (deleteError) {
      console.error('[API /conversations/[id] DELETE] Error deleting conversation:', deleteError);
      throw deleteError;
    }

    console.log('[API /conversations/[id] DELETE] Successfully deleted conversation:', conversationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /conversations/[id] DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}

// PATCH a conversation (rename)
export async function PATCH(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  console.log('[API /conversations/[id] PATCH] Fetching currentUser');
  const user = await currentUser();
  console.log('[API /conversations/[id] PATCH] currentUser result:', user ? `Found: ${user?.id}` : 'Not found');
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversationId = params.conversationId;
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversation ID' }, { status: 400 });
  }
  
  // Get the new name from request body
  let updateData;
  try {
    updateData = await request.json();
    
    if (!updateData.name || typeof updateData.name !== 'string' || !updateData.name.trim()) {
      return NextResponse.json({ error: 'Invalid name provided' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = createClient();

  try {
    console.log('[API /conversations/[id] PATCH] Updating conversation:', conversationId, 'with name:', updateData.name);
    
    // First verify the user owns this conversation
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('clerk_id', user.id)
      .single();
      
    if (fetchError || !conversation) {
      console.error('[API /conversations/[id] PATCH] Conversation not found or access denied:', fetchError);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    // Update the conversation name
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        name: updateData.name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('clerk_id', user.id);

    if (updateError) {
      console.error('[API /conversations/[id] PATCH] Error updating conversation:', updateError);
      throw updateError;
    }

    console.log('[API /conversations/[id] PATCH] Successfully updated conversation name');
    return NextResponse.json({ success: true, name: updateData.name.trim() });
  } catch (error) {
    console.error('[API /conversations/[id] PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
} 