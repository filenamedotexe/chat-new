import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { 
  getFilesUploadedByUser, 
  getUserFileSummary,
  getShareableFiles 
} from '@/features/files/data/files';
import type { UserRole } from '@chat/shared-types';

/**
 * GET /api/users/[id]/files - Get files uploaded by a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const targetUserId = params.id;

    // Permission check: users can only see their own files unless they're admin
    if (session.user.role !== 'admin' && session.user.id !== targetUserId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    switch (action) {
      case 'summary':
        const summary = await getUserFileSummary(
          targetUserId,
          session.user.role as UserRole
        );
        return NextResponse.json(summary);

      case 'shareable':
        const targetProjectId = searchParams.get('projectId') || undefined;
        const shareableFiles = await getShareableFiles(
          targetUserId,
          session.user.role as UserRole,
          targetProjectId
        );
        return NextResponse.json(shareableFiles);

      case 'list':
      default:
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
        const fileType = searchParams.get('fileType') || undefined;
        const searchTerm = searchParams.get('search') || undefined;

        const files = await getFilesUploadedByUser(
          targetUserId,
          session.user.role as UserRole,
          { limit, offset, fileType, searchTerm }
        );

        return NextResponse.json(files);
    }
  } catch (error) {
    console.error('Error fetching user files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user files' },
      { status: 500 }
    );
  }
}