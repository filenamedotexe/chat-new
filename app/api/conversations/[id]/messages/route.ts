import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth/api-auth';
import { 
  getConversation,
  getConversationMessages,
  createMessage
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

    // Check if user has access to this conversation
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'team_member') {
      if (conversation.clientId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get messages
    const messages = await getConversationMessages(conversationId, limit, offset);

    // Filter internal notes for non-admin users
    const visibleMessages = (userRole === 'admin' || userRole === 'team_member') 
      ? messages 
      : messages.filter(msg => !msg.isInternalNote);

    return NextResponse.json({
      messages: visibleMessages,
      total: visibleMessages.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await authMiddleware();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    const userId = session.user.id;
    const conversationId = params.id;

    // Check if user has access to this conversation
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'team_member') {
      if (conversation.clientId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Parse request body
    const body = await request.json();
    const { content, isInternalNote = false } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Only admins/team members can create internal notes
    const createInternalNote = isInternalNote && (userRole === 'admin' || userRole === 'team_member');

    // Create the message
    const message = await createMessage(
      conversationId,
      userId,
      content,
      createInternalNote
    );

    return NextResponse.json({ 
      message,
      created: true 
    });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}