import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { getFileById } from '@/features/files/data/files';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { UserRole } from '@chat/shared-types';

/**
 * GET /api/files/[id]/download - Download a file with permission check
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

    // Get file record with permission check
    const fileRecord = await getFileById(
      params.id,
      session.user.id,
      session.user.role as UserRole
    );

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fileRecord.file;

    // Check if file exists on disk
    const fullPath = path.join(process.cwd(), 'public', file.filePath.substring(1));
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      );
    }

    // Read file from disk
    const fileBuffer = await readFile(fullPath);

    // Set appropriate headers for download
    const headers = new Headers();
    headers.set('Content-Type', file.mimeType);
    headers.set('Content-Length', file.fileSize.toString());
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.originalName)}"`
    );
    headers.set('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour

    // Log the download (could be enhanced for analytics)
    console.log(`File downloaded: ${file.originalName} by ${session.user.email}`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/files/[id]/download - Check if file is downloadable without transferring content
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse(null, { status: 401 });
    }

    const fileRecord = await getFileById(
      params.id,
      session.user.id,
      session.user.role as UserRole
    );

    if (!fileRecord) {
      return new NextResponse(null, { status: 404 });
    }

    const file = fileRecord.file;
    const fullPath = path.join(process.cwd(), 'public', file.filePath.substring(1));
    
    if (!existsSync(fullPath)) {
      return new NextResponse(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', file.mimeType);
    headers.set('Content-Length', file.fileSize.toString());
    headers.set('Cache-Control', 'private, max-age=3600');

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('File HEAD error:', error);
    return new NextResponse(null, { status: 500 });
  }
}