import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { updateFileAssociations, getFileById } from '@/features/files/data/files';
import type { UserRole } from '@chat/shared-types';

/**
 * POST /api/files/[id]/share - Share a file to another project/task
 */
export async function POST(
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

    if (!projectId && !taskId) {
      return NextResponse.json(
        { error: 'Either projectId or taskId must be provided' },
        { status: 400 }
      );
    }

    // Get the file to check permissions
    const file = await getFileById(
      params.id,
      user.id,
      user.role as UserRole
    );

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Permission check: Only file owners and admins can share files
    if (
      user.role !== 'admin' && 
      file.file.uploadedById !== user.id
    ) {
      return NextResponse.json(
        { error: 'You can only share files you uploaded' },
        { status: 403 }
      );
    }

    // Update file associations
    const updatedFile = await updateFileAssociations(
      params.id,
      { projectId, taskId },
      user.id,
      user.role as UserRole
    );

    if (!updatedFile) {
      return NextResponse.json(
        { error: 'Failed to share file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: updatedFile,
      message: `File shared to ${projectId ? 'project' : 'task'} successfully`
    });

  } catch (error) {
    console.error('Error sharing file:', error);
    return NextResponse.json(
      { error: 'Failed to share file' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files/[id]/share - Remove file from project/task (unshare)
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

    // Get the file to check permissions
    const file = await getFileById(
      params.id,
      user.id,
      user.role as UserRole
    );

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Permission check: Only file owners and admins can unshare files
    if (
      user.role !== 'admin' && 
      file.file.uploadedById !== user.id
    ) {
      return NextResponse.json(
        { error: 'You can only unshare files you uploaded' },
        { status: 403 }
      );
    }

    // Remove associations (set to null)
    const updatedFile = await updateFileAssociations(
      params.id,
      { projectId: null, taskId: null },
      user.id,
      user.role as UserRole
    );

    if (!updatedFile) {
      return NextResponse.json(
        { error: 'Failed to unshare file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: updatedFile,
      message: 'File unshared successfully'
    });

  } catch (error) {
    console.error('Error unsharing file:', error);
    return NextResponse.json(
      { error: 'Failed to unshare file' },
      { status: 500 }
    );
  }
}