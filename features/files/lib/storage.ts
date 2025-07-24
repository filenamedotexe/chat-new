import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Uploaded file metadata
export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Saves file buffer to local storage
 */
export async function saveFileToStorage(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  uploadedBy: string
): Promise<UploadedFile> {
  // Generate unique filename
  const fileId = uuidv4();
  const extension = path.extname(originalName);
  const fileName = `${fileId}${extension}`;
  
  // Create upload directory structure
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const yearDir = path.join(uploadDir, new Date().getFullYear().toString());
  const monthDir = path.join(yearDir, (new Date().getMonth() + 1).toString().padStart(2, '0'));
  
  // Ensure directories exist
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  if (!existsSync(yearDir)) {
    await mkdir(yearDir, { recursive: true });
  }
  if (!existsSync(monthDir)) {
    await mkdir(monthDir, { recursive: true });
  }
  
  // Write file
  const filePath = path.join(monthDir, fileName);
  await writeFile(filePath, fileBuffer);
  
  // Return file metadata
  const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath);
  
  return {
    id: fileId,
    originalName,
    fileName,
    filePath: `/${relativePath.replace(/\\/g, '/')}`, // Ensure forward slashes for web
    mimeType,
    size: fileBuffer.length,
    uploadedAt: new Date(),
    uploadedBy,
  };
}

/**
 * Deletes a file from storage
 */
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
  
  if (existsSync(fullPath)) {
    const fs = await import('fs/promises');
    await fs.unlink(fullPath);
  }
}

/**
 * Gets file stats from storage
 */
export async function getFileStats(filePath: string): Promise<{ size: number; exists: boolean }> {
  const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
  
  if (!existsSync(fullPath)) {
    return { size: 0, exists: false };
  }
  
  const fs = await import('fs/promises');
  const stats = await fs.stat(fullPath);
  
  return {
    size: stats.size,
    exists: true,
  };
}