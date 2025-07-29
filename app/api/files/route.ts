import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { getFilesForUser } from '@/features/files/data/files';
import { validateFile, validateFileList, getFileTypeCategory } from '@/features/files/lib/client-utils';
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
 * POST /api/files - Upload files using Supabase Storage
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

    // Create Supabase client with service role for storage operations
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

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
        const fileBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(fileBuffer);

        // Generate unique file path
        const fileExt = file.name.substring(file.name.lastIndexOf('.'));
        const fileName = `${crypto.randomUUID()}${fileExt}`;
        const filePath = `user-uploads/${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          errors.push({
            fileName: file.name,
            error: 'Failed to upload to storage'
          });
          continue;
        }

        // Create file record in database
        const { data: fileRecord, error: dbError } = await supabase
          .from('files')
          .insert({
            original_name: file.name,
            file_name: fileName,
            file_path: uploadData.path,
            storage_type: 'supabase',
            file_size: file.size,
            file_type: getFileTypeCategory(file.type),
            mime_type: file.type,
            uploaded_by_id: user.id,
            project_id: projectId || null,
            task_id: taskId || null
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database insert error:', dbError);
          // Try to clean up the uploaded file
          await supabase.storage
            .from('user-uploads')
            .remove([uploadData.path]);
          
          errors.push({
            fileName: file.name,
            error: 'Failed to create file record'
          });
          continue;
        }

        // Log the activity
        try {
          await createActivityLog({
            userId: user.id,
            userRole: user.role,
            userName: user.name,
            action: ActivityActions.FILE_UPLOADED,
            entityType: EntityTypes.FILE,
            entityId: fileRecord.id,
            entityName: fileRecord.original_name,
            projectId: projectId || undefined,
            taskId: taskId || undefined,
            metadata: {
              fileSize: fileRecord.file_size,
              fileType: fileRecord.file_type,
              mimeType: fileRecord.mime_type,
            },
          });
        } catch (logError) {
          console.error('Failed to log activity:', logError);
        }

        uploadedFiles.push({
          id: fileRecord.id,
          originalName: fileRecord.original_name,
          fileName: fileRecord.file_name,
          filePath: fileRecord.file_path,
          mimeType: fileRecord.mime_type,
          fileType: fileRecord.file_type,
          fileSize: fileRecord.file_size,
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