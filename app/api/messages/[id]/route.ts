import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { updateMessage, deleteMessage } from '@/features/chat/data/messages';
import type { UserRole } from '@chat/shared-types';

/**
 * PATCH /api/messages/[id] - Update a message
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) {
      return error;
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const updated = await updateMessage(
      params.id,
      user.id,
      content
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Message not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: updated,
    });
  } catch (error) {
    console.error('Message PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/[id] - Delete a message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) {
      return error;
    }

    const success = await deleteMessage(
      params.id,
      user.id,
      user.role as UserRole
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Message not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Message DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}