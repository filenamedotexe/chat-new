import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { createFile, getFilesForUser } from '@/features/files/data/files';
import { validateFile, validateFileList } from '@/features/files/lib/client-utils';
import { createActivityLog } from '@/features/timeline/data/activity';
import { ActivityActions, EntityTypes } from '@/packages/database/src/schema/activity';
import type { UserRole } from '@chat/shared-types';

// Maximum request size (10MB)
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/files - Get files for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) {
      return error;
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || undefined;
    const taskId = searchParams.get('taskId') || undefined;
    const fileType = searchParams.get('fileType') || undefined;

    const files = await getFilesForUser(
      user.id,
      user.role as UserRole,
      { projectId, taskId, fileType }
    );

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Files GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files - Upload files
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) {
      return error;
    }

    // Only admin and team_member can upload files
    if (user.role === 'client') {
      return NextResponse.json(
        { error: 'Clients cannot upload files' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const projectId = formData.get('projectId') as string | null;
    const taskId = formData.get('taskId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate files
    const validation = validateFileList(files);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Process each file
    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        // Validate individual file
        const fileValidation = validateFile(file);
        if (!fileValidation.isValid) {
          errors.push({ 
            fileName: file.name, 
            error: fileValidation.error 
          });
          continue;
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Create file record
        const uploadedFile = await createFile({
          originalName: file.name,
          mimeType: file.type,
          buffer,
          projectId: projectId || undefined,
          taskId: taskId || undefined,
          uploadedById: user.id,
        });

        // Log the activity
        try {
          await createActivityLog({
            userId: user.id,
            userRole: user.role,
            userName: user.name,
            action: ActivityActions.FILE_UPLOADED,
            entityType: EntityTypes.FILE,
            entityId: uploadedFile.id,
            entityName: uploadedFile.originalName,
            projectId: projectId || undefined,
            taskId: taskId || undefined,
            metadata: {
              fileSize: uploadedFile.fileSize,
              fileType: uploadedFile.fileType,
              mimeType: uploadedFile.mimeType,
            },
          });
        } catch (logError) {
          console.error('Failed to log activity:', logError);
        }

        uploadedFiles.push({
          ...uploadedFile,
          warnings: fileValidation.warnings,
        });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        errors.push({ 
          fileName: file.name, 
          error: 'Upload failed' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message: `${uploadedFiles.length} file(s) uploaded successfully${
        errors.length > 0 ? `, ${errors.length} failed` : ''
      }`,
    });
  } catch (error) {
    console.error('Files POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}