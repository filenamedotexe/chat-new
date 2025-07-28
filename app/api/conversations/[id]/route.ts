import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth/api-auth';
import { 
  getConversation, 
  getConversationMessages,
  updateConversation 
} from '@/features/support-chat/lib/conversations';
import type { UserRole } from '@chat/shared-types';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await authMiddleware();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    const userId = session.user.id;
    const conversationId = params.id;

    // Get the conversation
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check permissions
    // Admins and team members can see any conversation
    // Users can only see their own conversations
    if (userRole !== 'admin' && userRole !== 'team_member') {
      if (conversation.clientId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get messages for the conversation
    const messages = await getConversationMessages(conversationId);

    // For non-admin users, filter out internal notes
    const visibleMessages = (userRole === 'admin' || userRole === 'team_member') 
      ? messages 
      : messages.filter(msg => !msg.isInternalNote);

    return NextResponse.json({
      conversation,
      messages: visibleMessages,
      messageCount: visibleMessages.length
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await authMiddleware();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    const conversationId = params.id;

    // Only admins and team members can update conversations
    if (userRole !== 'admin' && userRole !== 'team_member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { status, assignedTo, priority } = body;

    // Validate inputs
    if (status && !['active', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "resolved"' },
        { status: 400 }
      );
    }

    if (priority && !['high', 'normal', 'low'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be "high", "normal", or "low"' },
        { status: 400 }
      );
    }

    // Check conversation exists
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Update the conversation
    const updates: Parameters<typeof updateConversation>[1] = {};
    if (status !== undefined) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (priority !== undefined) updates.priority = priority;

    const updated = await updateConversation(conversationId, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
    }

    return NextResponse.json({
      conversation: updated,
      updated: true
    });

  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}