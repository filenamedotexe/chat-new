import { NextRequest } from 'next/server';
import { getUnifiedAuth } from '@/lib/auth/unified-auth';
import { getConversation, getConversationMessages } from '@/features/support-chat/lib/conversations';
import type { UserRole } from '@chat/shared-types';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get the authenticated user
    const session = await getUnifiedAuth(request);
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const userRole = session.user.role as UserRole;
    const userId = session.user.id;
    const conversationId = params.id;

    // Validate conversation ID format first
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid conversation ID' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user has access to this conversation
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'team_member') {
      if (conversation.clientId !== userId) {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Set up SSE headers
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    };

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        const encoder = new TextEncoder();
        
        const sendEvent = (eventType: string, data: unknown) => {
          const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Send connection established event
        sendEvent('connected', {
          conversationId,
          timestamp: new Date().toISOString(),
          userId,
          userRole
        });

        // Send initial messages
        getConversationMessages(conversationId, 50, 0).then(messages => {
          // Filter internal notes for non-admin users
          const visibleMessages = (userRole === 'admin' || userRole === 'team_member') 
            ? messages 
            : messages.filter(msg => !msg.isInternalNote);

          sendEvent('initial-messages', {
            messages: visibleMessages,
            total: visibleMessages.length
          });
        }).catch(error => {
          console.error('Error fetching initial messages:', error);
          sendEvent('error', { message: 'Failed to fetch messages' });
        });

        // Set up heartbeat interval
        const heartbeatInterval = setInterval(() => {
          sendEvent('heartbeat', { timestamp: new Date().toISOString() });
        }, 30000); // Send heartbeat every 30 seconds

        // Set up message polling for new messages
        let lastMessageId: string | null = null;
        
        const pollForMessages = async () => {
          try {
            const messages = await getConversationMessages(conversationId, 10, 0);
            
            // Filter internal notes for non-admin users
            const visibleMessages = (userRole === 'admin' || userRole === 'team_member') 
              ? messages 
              : messages.filter(msg => !msg.isInternalNote);

            if (visibleMessages.length > 0) {
              const latestMessage = visibleMessages[0];
              
              // If this is a new message (different from last seen)
              if (lastMessageId !== latestMessage.id) {
                lastMessageId = latestMessage.id;
                
                sendEvent('new-message', {
                  message: latestMessage,
                  conversationId
                });
              }
            }
          } catch (error) {
            console.error('Error polling for messages:', error);
            sendEvent('error', { message: 'Failed to poll for messages' });
          }
        };

        // Poll for new messages every 3 seconds
        const pollInterval = setInterval(pollForMessages, 3000);

        // Cleanup function for when connection closes
        const cleanup = () => {
          clearInterval(heartbeatInterval);
          clearInterval(pollInterval);
          
          try {
            controller.close();
          } catch {
            // Connection already closed
          }
        };

        // Handle client disconnect
        request.signal.addEventListener('abort', cleanup);

        // Auto-cleanup after 30 minutes to prevent zombie connections
        setTimeout(cleanup, 30 * 60 * 1000);
      }
    });

    return new Response(stream, { headers });

  } catch (error) {
    console.error('Error in SSE endpoint:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}