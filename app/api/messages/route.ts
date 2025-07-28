import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { createMessage, getProjectMessages, getTaskMessages, getDirectMessages } from '@/features/chat/data/messages';
import type { UserRole } from '@chat/shared-types';

/**
 * GET /api/messages - Get messages with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) {
      return error;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const taskId = searchParams.get('taskId');
    const recipientId = searchParams.get('recipientId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let messages;

    if (projectId) {
      // Get project messages
      messages = await getProjectMessages(
        projectId,
        user.id,
        user.role as UserRole,
        { limit, offset }
      );
    } else if (taskId) {
      // Get task messages
      messages = await getTaskMessages(
        taskId,
        user.id,
        user.role as UserRole,
        { limit, offset }
      );
    } else if (recipientId) {
      // Get direct messages
      messages = await getDirectMessages(
        user.id,
        recipientId,
        { limit, offset }
      );
    } else {
      return NextResponse.json(
        { error: 'Must provide projectId, taskId, or recipientId' },
        { status: 400 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages - Create a new message
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) {
      return error;
    }

    const body = await request.json();
    const { content, projectId, taskId, recipientId, parentMessageId, type } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create the message
    const message = await createMessage({
      content,
      projectId,
      taskId,
      recipientId,
      parentMessageId,
      senderId: user.id,
      type: type || 'text',
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Message POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}