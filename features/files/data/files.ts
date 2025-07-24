import { db } from '@chat/database';
import { files, users, projects, tasks } from '@chat/database';
import { eq, and, desc, isNull, ilike } from 'drizzle-orm';
import { saveFileToStorage, deleteFileFromStorage } from '../lib/storage';
import { getFileTypeCategory } from '../lib/client-utils';
import type { UserRole } from '@chat/shared-types';

export interface CreateFileInput {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  projectId?: string;
  taskId?: string;
  uploadedById: string;
}

export interface FileWithAssociations {
  file: typeof files.$inferSelect;
  uploader: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  task: {
    id: string;
    title: string;
  } | null;
}

/**
 * Creates a new file record and saves file to storage
 */
export async function createFile(input: CreateFileInput): Promise<typeof files.$inferSelect> {
  let uploadedFile: any;
  
  try {
    // Save file to local storage first
    uploadedFile = await saveFileToStorage(
      input.buffer,
      input.originalName,
      input.mimeType,
      input.uploadedById
    );
    
    // Create database record
    const [fileRecord] = await db
      .insert(files)
      .values({
        originalName: input.originalName,
        fileName: uploadedFile.fileName,
        mimeType: input.mimeType,
        fileType: getFileTypeCategory(input.mimeType) as any,
        fileSize: input.buffer.length,
        storageType: 'local',
        filePath: uploadedFile.filePath,
        projectId: input.projectId,
        taskId: input.taskId,
        uploadedById: input.uploadedById,
      })
      .returning();

    return fileRecord;
  } catch (error) {
    console.error('[createFile] Error:', error);
    
    // If file was saved but database insert failed, try to clean up
    if (uploadedFile?.filePath) {
      try {
        await deleteFileFromStorage(uploadedFile.filePath);
        console.log('[createFile] Cleaned up orphaned file:', uploadedFile.filePath);
      } catch (cleanupError) {
        console.error('[createFile] Failed to clean up file:', cleanupError);
      }
    }
    
    throw error;
  }
}

/**
 * Gets files with associations for a user based on their role
 */
export async function getFilesForUser(
  userId: string,
  userRole: UserRole,
  filters?: {
    projectId?: string;
    taskId?: string;
    fileType?: string;
  }
): Promise<FileWithAssociations[]> {
  // Build where conditions
  let whereConditions = [isNull(files.deletedAt)];

  // Apply role-based filtering
  if (userRole === 'client') {
    // Clients can only see files in their own projects
    const { organizationMembers } = await import('@chat/database');
    
    const userOrgs = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
    
    const orgIds = userOrgs.map(o => o.organizationId);
    
    if (orgIds.length > 0) {
      whereConditions.push(eq(projects.organizationId, orgIds[0])); // Simplified for now
    } else {
      // No organizations = no files
      return [];
    }
  }

  // Apply additional filters
  if (filters?.projectId) {
    whereConditions.push(eq(files.projectId, filters.projectId));
  }

  if (filters?.taskId) {
    whereConditions.push(eq(files.taskId, filters.taskId));
  }

  if (filters?.fileType) {
    whereConditions.push(eq(files.fileType, filters.fileType as any));
  }

  const results = await db
    .select({
      file: files,
      uploader: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      project: {
        id: projects.id,
        name: projects.name,
      },
      task: {
        id: tasks.id,
        title: tasks.title,
      },
    })
    .from(files)
    .leftJoin(users, eq(files.uploadedById, users.id))
    .leftJoin(projects, eq(files.projectId, projects.id))
    .leftJoin(tasks, eq(files.taskId, tasks.id))
    .where(and(...whereConditions))
    .orderBy(desc(files.createdAt));
  
  return results.map(result => ({
    file: result.file,
    uploader: result.uploader,
    project: result.project,
    task: result.task,
  }));
}

/**
 * Gets a single file by ID with permission checking
 */
export async function getFileById(
  fileId: string,
  userId: string,
  userRole: UserRole
): Promise<FileWithAssociations | null> {
  const [result] = await db
    .select({
      file: files,
      uploader: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      project: {
        id: projects.id,
        name: projects.name,
      },
      task: {
        id: tasks.id,
        title: tasks.title,
      },
    })
    .from(files)
    .leftJoin(users, eq(files.uploadedById, users.id))
    .leftJoin(projects, eq(files.projectId, projects.id))
    .leftJoin(tasks, eq(files.taskId, tasks.id))
    .where(
      and(
        eq(files.id, fileId),
        isNull(files.deletedAt)
      )
    )
    .limit(1);

  if (!result) return null;

  // Check permissions
  if (userRole === 'client') {
    // Clients can only access files in their projects
    const { organizationMembers } = await import('@chat/database');
    
    const userOrgs = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
    
    const orgIds = userOrgs.map(o => o.organizationId);
    
    if (result.project && !orgIds.includes(result.project.id)) {
      return null; // No access
    }
  }

  return {
    file: result.file,
    uploader: result.uploader,
    project: result.project,
    task: result.task,
  };
}

/**
 * Gets files associated with a specific project
 */
export async function getFilesByProject(
  projectId: string,
  userId: string,
  userRole: UserRole
): Promise<FileWithAssociations[]> {
  return getFilesForUser(userId, userRole, { projectId });
}

/**
 * Gets files associated with a specific task
 */
export async function getFilesByTask(
  taskId: string,
  userId: string,
  userRole: UserRole
): Promise<FileWithAssociations[]> {
  return getFilesForUser(userId, userRole, { taskId });
}

/**
 * Soft deletes a file (marks as deleted)
 */
export async function deleteFile(
  fileId: string,
  userId: string,
  userRole: UserRole
): Promise<boolean> {
  // Check if user can delete this file
  const file = await getFileById(fileId, userId, userRole);
  if (!file) return false;

  // Only admins and file uploaders can delete files
  if (userRole !== 'admin' && file.file.uploadedById !== userId) {
    return false;
  }

  await db
    .update(files)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(files.id, fileId));

  return true;
}

/**
 * Updates file associations (project/task)
 */
export async function updateFileAssociations(
  fileId: string,
  associations: {
    projectId?: string | null;
    taskId?: string | null;
  },
  userId: string,
  userRole: UserRole
): Promise<typeof files.$inferSelect | null> {
  // Check permissions
  const file = await getFileById(fileId, userId, userRole);
  if (!file) return null;

  // Only admins and file uploaders can update associations
  if (userRole !== 'admin' && file.file.uploadedById !== userId) {
    return null;
  }

  const [updated] = await db
    .update(files)
    .set({
      projectId: associations.projectId,
      taskId: associations.taskId,
      updatedAt: new Date(),
    })
    .where(eq(files.id, fileId))
    .returning();

  return updated;
}

/**
 * Gets file statistics for dashboard
 */
export async function getFileStats(
  userId: string,
  userRole: UserRole
): Promise<{
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  recentFiles: FileWithAssociations[];
}> {
  const userFiles = await getFilesForUser(userId, userRole);
  
  const totalFiles = userFiles.length;
  const totalSize = userFiles.reduce((sum, f) => sum + (f.file.fileSize || 0), 0);
  
  const filesByType = userFiles.reduce((acc, f) => {
    const type = f.file.fileType || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const recentFiles = userFiles.slice(0, 10); // Last 10 files
  
  return {
    totalFiles,
    totalSize,
    filesByType,
    recentFiles,
  };
}

/**
 * Gets all files uploaded by a specific user across all projects
 */
export async function getFilesUploadedByUser(
  userId: string,
  userRole: UserRole,
  options?: {
    limit?: number;
    offset?: number;
    fileType?: string;
    searchTerm?: string;
  }
): Promise<FileWithAssociations[]> {
  let whereConditions = [
    isNull(files.deletedAt),
    eq(files.uploadedById, userId)
  ];

  // Apply file type filter
  if (options?.fileType) {
    whereConditions.push(eq(files.fileType, options.fileType as any));
  }

  // Apply search filter
  if (options?.searchTerm) {
    whereConditions.push(
      // Search in original name
      ilike(files.originalName, `%${options.searchTerm}%`)
    );
  }

  // Role-based access control
  if (userRole === 'client') {
    // Clients can only see files in their own organization's projects
    const { organizationMembers } = await import('@chat/database');
    
    const userOrgs = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
    
    const orgIds = userOrgs.map(o => o.organizationId);
    
    if (orgIds.length > 0) {
      whereConditions.push(eq(projects.organizationId, orgIds[0])); // Simplified for now
    } else {
      return [];
    }
  }

  const query = db
    .select({
      file: files,
      uploader: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      project: {
        id: projects.id,
        name: projects.name,
      },
      task: {
        id: tasks.id,
        title: tasks.title,
      },
    })
    .from(files)
    .leftJoin(users, eq(files.uploadedById, users.id))
    .leftJoin(projects, eq(files.projectId, projects.id))
    .leftJoin(tasks, eq(files.taskId, tasks.id))
    .where(and(...whereConditions))
    .orderBy(desc(files.createdAt));

  // Apply pagination
  if (options?.limit) {
    if (options?.offset) {
      const results = await query.limit(options.limit).offset(options.offset);
      return results.map(result => ({
        file: result.file,
        uploader: result.uploader,
        project: result.project,
        task: result.task,
      }));
    } else {
      const results = await query.limit(options.limit);
      return results.map(result => ({
        file: result.file,
        uploader: result.uploader,
        project: result.project,
        task: result.task,
      }));
    }
  }

  const results = await query;
  return results.map(result => ({
    file: result.file,
    uploader: result.uploader,
    project: result.project,
    task: result.task,
  }));
}

/**
 * Gets user's file summary for dashboard
 */
export async function getUserFileSummary(
  userId: string,
  userRole: UserRole
): Promise<{
  totalFiles: number;
  totalSizeBytes: number;
  filesByType: Record<string, number>;
  recentUploads: FileWithAssociations[];
  filesByProject: Record<string, number>;
}> {
  const userFiles = await getFilesUploadedByUser(userId, userRole, { limit: 100 });
  
  const totalFiles = userFiles.length;
  const totalSizeBytes = userFiles.reduce((sum, f) => sum + (f.file.fileSize || 0), 0);
  
  const filesByType = userFiles.reduce((acc, f) => {
    const type = f.file.fileType || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filesByProject = userFiles.reduce((acc, f) => {
    const projectName = f.project?.name || 'No Project';
    acc[projectName] = (acc[projectName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const recentUploads = userFiles.slice(0, 5); // Last 5 files
  
  return {
    totalFiles,
    totalSizeBytes,
    filesByType,
    recentUploads,
    filesByProject,
  };
}

/**
 * Gets files that can be shared across projects by user
 */
export async function getShareableFiles(
  userId: string,
  userRole: UserRole,
  targetProjectId?: string
): Promise<FileWithAssociations[]> {
  // Admin and team members can share any files they uploaded
  // Clients can only share files within their organization
  
  const userFiles = await getFilesUploadedByUser(userId, userRole);
  
  // If targeting a specific project, filter files that aren't already in that project
  if (targetProjectId) {
    return userFiles.filter(f => f.file.projectId !== targetProjectId);
  }
  
  return userFiles;
}