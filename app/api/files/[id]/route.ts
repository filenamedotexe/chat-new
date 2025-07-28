import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { getFileById, deleteFile, updateFileAssociations } from '@/features/files/data/files';
import type { UserRole } from '@chat/shared-types';

/**
 * GET /api/files/[id] - Get a specific file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) {
      return error;
    }

    const file = await getFileById(
      params.id,
      user.id,
      user.role as UserRole
    );

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('File GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/files/[id] - Update file associations
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
    const { projectId, taskId } = body;

    const updatedFile = await updateFileAssociations(
      params.id,
      { projectId, taskId },
      user.id,
      user.role as UserRole
    );

    if (!updatedFile) {
      return NextResponse.json(
        { error: 'File not found or insufficient permissions' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      file: updatedFile,
      message: 'File associations updated successfully',
    });
  } catch (error) {
    console.error('File PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files/[id] - Delete a file
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

    const success = await deleteFile(
      params.id,
      user.id,
      user.role as UserRole
    );

    if (!success) {
      return NextResponse.json(
        { error: 'File not found or insufficient permissions' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}