// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB per upload session

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  archives: ['application/zip', 'application/x-rar-compressed'],
  code: ['text/javascript', 'text/css', 'text/html', 'application/json'],
} as const;

export const ALL_ALLOWED_TYPES = Object.values(ALLOWED_FILE_TYPES).flat();

// File validation interface
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Validates a file before upload
 */
export function validateFile(file: File, allowedTypes?: string[]): FileValidationResult {
  const allowedMimeTypes = allowedTypes || ALL_ALLOWED_TYPES;
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum file size is ${formatFileSize(MAX_FILE_SIZE)}.`
    };
  }
  
  // Check file type
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not allowed. Please upload one of the supported file types.`
    };
  }
  
  // Check for empty files
  if (file.size === 0) {
    return {
      isValid: false,
      error: `File "${file.name}" is empty.`
    };
  }
  
  const warnings: string[] = [];
  
  // Warn about large files
  if (file.size > 5 * 1024 * 1024) { // 5MB
    warnings.push(`File "${file.name}" is large (${formatFileSize(file.size)}). Upload may take longer.`);
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validates a list of files before upload
 */
export function validateFileList(files: File[], allowedTypes?: string[]): FileValidationResult {
  if (files.length === 0) {
    return {
      isValid: false,
      error: 'No files selected for upload.'
    };
  }
  
  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    return {
      isValid: false,
      error: `Total file size (${formatFileSize(totalSize)}) exceeds the maximum allowed (${formatFileSize(MAX_TOTAL_SIZE)}).`
    };
  }
  
  const warnings: string[] = [];
  
  // Validate individual files
  for (const file of files) {
    const result = validateFile(file, allowedTypes);
    if (!result.isValid) {
      return result;
    }
    if (result.warnings) {
      warnings.push(...result.warnings);
    }
  }
  
  // Check for duplicate names
  const fileNames = files.map(f => f.name.toLowerCase());
  const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate file names detected: ${duplicates.join(', ')}. Files will be renamed automatically.`);
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gets the file type category based on MIME type
 */
export function getFileTypeCategory(mimeType: string): string {
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if ((types as readonly string[]).includes(mimeType)) {
      // Convert plural category names to singular for database enum
      const singularMap: Record<string, string> = {
        'images': 'image',
        'documents': 'document',
        'spreadsheets': 'spreadsheet',
        'presentations': 'presentation',
        'archives': 'archive',
        'code': 'code'
      };
      return singularMap[category] || category;
    }
  }
  return 'other';
}

/**
 * Gets a preview-friendly name for a file
 */
export function getPreviewName(fileName: string, maxLength: number = 30): string {
  if (fileName.length <= maxLength) {
    return fileName;
  }
  
  const extension = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 4) + '...';
  
  return truncatedName + '.' + extension;
}

/**
 * Checks if a file type supports image preview
 */
export function supportsImagePreview(mimeType: string): boolean {
  return (ALLOWED_FILE_TYPES.images as readonly string[]).includes(mimeType);
}