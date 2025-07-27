import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedAuth } from '@/lib/auth/unified-auth';
import { 
  getActiveConversations, 
  getOrCreateClientConversation
} from '@/features/support-chat/lib/conversations';
import type { UserRole } from '@chat/shared-types';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getUnifiedAuth(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    const userId = session.user.id;

    // Admins and team members can see all conversations
    if (userRole === 'admin' || userRole === 'team_member') {
      const conversations = await getActiveConversations();
      
      return NextResponse.json({
        conversations,
        total: conversations.length
      });
    }
    
    // Regular users and clients only see their own conversation
    if (userRole === 'user' || userRole === 'client') {
      const conversation = await getOrCreateClientConversation(userId);
      
      return NextResponse.json({
        conversations: [conversation],
        total: 1
      });
    }

    // Any other role should not have access
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getUnifiedAuth(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    const userId = session.user.id;

    // Only users and clients can create conversations
    if (userRole !== 'user' && userRole !== 'client') {
      return NextResponse.json(
        { error: 'Only clients can initiate conversations' }, 
        { status: 403 }
      );
    }

    // For POST, we always get or create a conversation for the client
    // This ensures they only have one active conversation at a time
    const conversation = await getOrCreateClientConversation(userId);

    return NextResponse.json({
      conversation,
      created: true // Indicates success, though it might be existing
    }, { status: 200 }); // Use 200 since it might not be newly created

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}