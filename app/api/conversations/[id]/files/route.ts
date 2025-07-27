import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedAuth } from '@/lib/auth/unified-auth';
import { createFile } from '@/features/files/data/files';
import { validateFile } from '@/features/files/lib/client-utils';
import { getConversation } from '@/features/support-chat/lib/conversations';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/conversations/[id]/files - Upload files for a specific conversation
 * Allows clients to upload files to their own conversations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
    // Validate conversation ID format
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const auth = await getUnifiedAuth(request);
    if (!auth || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the conversation to verify access
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this conversation
    const isClientOwner = auth.user.role === 'client' && conversation.clientId === auth.user.id;
    const isAdminOrTeam = auth.user.role === 'admin' || auth.user.role === 'team';
    
    if (!isClientOwner && !isAdminOrTeam) {
      return NextResponse.json(
        { error: 'Access denied to this conversation' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Limit file count for chat (max 5 files per message)
    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 files allowed per message' },
        { status: 400 }
      );
    }

    // Process each file
    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        // Validate file (size, type, etc.)
        const fileValidation = validateFile(file);
        if (!fileValidation.isValid) {
          errors.push({ 
            fileName: file.name, 
            error: fileValidation.error 
          });
          continue;
        }

        // Additional chat-specific validations
        // Max file size for chat: 25MB (more generous than general uploads)
        if (file.size > 25 * 1024 * 1024) {
          errors.push({
            fileName: file.name,
            error: 'File too large for chat (max 25MB)'
          });
          continue;
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Create file record with conversation context
        const uploadedFile = await createFile({
          originalName: file.name,
          mimeType: file.type,
          buffer,
          uploadedById: auth.user.id,
          // Note: We don't set projectId/taskId for chat files
          // They are associated through conversation messages
        });

        uploadedFiles.push({
          id: uploadedFile.id,
          originalName: uploadedFile.originalName,
          fileSize: uploadedFile.fileSize,
          mimeType: uploadedFile.mimeType,
          downloadUrl: `/api/files/${uploadedFile.id}/download`,
          warnings: fileValidation.warnings,
        });
      } catch (error) {
        console.error(`Error uploading chat file ${file.name}:`, error);
        errors.push({ 
          fileName: file.name, 
          error: 'Upload failed' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message: `${uploadedFiles.length} file(s) uploaded successfully${
        errors.length > 0 ? `, ${errors.length} failed` : ''
      }`,
    });
  } catch (error) {
    console.error('Chat file upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}