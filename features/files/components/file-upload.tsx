'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Card } from '@chat/ui';
import { 
  IconUpload, 
  IconX, 
  IconFile, 
  IconPhoto, 
  IconFileText,
  IconTable,
  IconPresentation,
  IconFileZip,
  IconCode,
  IconCheck,
  IconExclamationCircle,
  IconLoader2
} from '@tabler/icons-react';
import { 
  validateFile, 
  validateFileList, 
  formatFileSize,
  getFileTypeCategory,
  MAX_FILE_SIZE 
} from '../lib/client-utils';
import { uploadFilesEdgeFunction } from '@/lib/api/edge-functions';

interface UploadedFileResult {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileType: string;
  fileSize: number;
  warnings?: string[];
}

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFileResult[]) => void;
  onUploadError?: (error: string) => void;
  projectId?: string;
  taskId?: string;
  maxFiles?: number;
  allowedTypes?: string[];
  className?: string;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
  warnings?: string[];
}

const getFileIcon = (type: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  
  switch (type) {
    case 'image': return <IconPhoto className={sizeClass} />;
    case 'document': return <IconFileText className={sizeClass} />;
    case 'spreadsheet': return <IconTable className={sizeClass} />;
    case 'presentation': return <IconPresentation className={sizeClass} />;
    case 'archive': return <IconFileZip className={sizeClass} />;
    case 'code': return <IconCode className={sizeClass} />;
    default: return <IconFile className={sizeClass} />;
  }
};

export function FileUpload({
  onUploadComplete,
  onUploadError,
  projectId,
  taskId,
  maxFiles = 10,
  allowedTypes,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithPreview[] = acceptedFiles.map((file, index) => {
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id: `${Date.now()}-${index}`,
        uploadStatus: 'pending' as const,
        uploadProgress: 0,
      });

      // Create preview for images
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        fileWithPreview.uploadStatus = 'error';
        fileWithPreview.uploadError = validation.error;
      } else if (validation.warnings) {
        fileWithPreview.warnings = validation.warnings;
      }

      return fileWithPreview;
    });

    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > maxFiles) {
        onUploadError?.(`Maximum ${maxFiles} files allowed`);
        return prev;
      }
      return combined;
    });
  }, [maxFiles, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: allowedTypes ? 
      allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : 
      undefined,
    disabled: uploading || uploadComplete,
    noClick: false,
    noKeyboard: false,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Revoke preview URLs to prevent memory leaks
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updated;
    });
  };

  const clearFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setUploadComplete(false);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.uploadStatus !== 'error');
    if (validFiles.length === 0) {
      onUploadError?.('No valid files to upload');
      return;
    }

    // Validate file list
    const validation = validateFileList(validFiles);
    if (!validation.isValid) {
      onUploadError?.(validation.error || 'File validation failed');
      return;
    }

    setUploading(true);

    try {
      // Update upload progress
      setFiles(prev => prev.map(f => 
        validFiles.find(vf => vf.id === f.id) ? 
          { ...f, uploadStatus: 'uploading' as const, uploadProgress: 0 } : 
          f
      ));

      // Use Edge Function for file upload
      console.log('🚀 Calling Edge Function with:', { 
        fileCount: validFiles.length, 
        projectId, 
        taskId 
      });
      
      const result = await uploadFilesEdgeFunction(validFiles, {
        projectId,
        taskId
      });
      
      console.log('📊 Edge Function result:', result);

      // Update file statuses
      setFiles(prev => prev.map(f => {
        const uploaded = result.uploadedFiles?.find((uf: any) => 
          uf.original_name === f.name
        );
        
        console.log('🔍 Matching file:', f.name, 'with uploaded:', result.uploadedFiles?.map((uf: any) => uf.original_name));
        const error = result.errors?.find((e: any) => e.fileName === f.name);

        if (uploaded) {
          return {
            ...f,
            uploadStatus: 'success' as const,
            uploadProgress: 100,
            warnings: uploaded.warnings,
          };
        } else if (error) {
          return {
            ...f,
            uploadStatus: 'error' as const,
            uploadError: error.error,
          };
        }
        return f;
      }));

      setUploadComplete(true);
      onUploadComplete?.(result.uploadedFiles || []);

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        validFiles.find(vf => vf.id === f.id) ? 
          { ...f, uploadStatus: 'error' as const, uploadError: 'Upload failed' } : 
          f
      ));
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const hasValidFiles = files.some(f => f.uploadStatus !== 'error');
  const allUploaded = files.length > 0 && files.every(f => f.uploadStatus === 'success');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      {!uploadComplete && (
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors bg-card shadow-md ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-testid="file-dropzone"
        >
            <input {...getInputProps()} ref={fileInputRef} />
            <div className="space-y-4">
              <IconUpload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </Button>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Maximum {maxFiles} files, {formatFileSize(MAX_FILE_SIZE)} per file</p>
                <p>Supported: Images, Documents, Spreadsheets, Presentations, Archives, Code</p>
              </div>
            </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">
              Files to Upload ({files.length})
            </h3>
            {!uploading && !uploadComplete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
              >
                <IconX className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {files.map((file) => {
              const fileType = getFileTypeCategory(file.type);
              
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(fileType)
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {fileType}
                    </p>
                    
                    {/* Status Messages */}
                    {file.uploadError && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <IconExclamationCircle className="h-3 w-3" />
                        {file.uploadError}
                      </p>
                    )}
                    
                    {file.warnings && file.warnings.length > 0 && (
                      <div className="mt-1">
                        {file.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-yellow-600 flex items-center gap-1">
                            <IconExclamationCircle className="h-3 w-3" />
                            {warning}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Progress Bar */}
                    {file.uploadStatus === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.uploadProgress || 0}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {file.uploadStatus === 'uploading' && (
                      <IconLoader2 className="h-5 w-5 animate-spin text-blue-500" data-testid="upload-progress" />
                    )}
                    {file.uploadStatus === 'success' && (
                      <IconCheck className="h-5 w-5 text-green-500" data-testid="upload-success" />
                    )}
                    {file.uploadStatus === 'error' && (
                      <IconExclamationCircle className="h-5 w-5 text-red-500" data-testid="upload-error" />
                    )}
                    {file.uploadStatus === 'pending' && !uploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upload Actions */}
          {!uploadComplete && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-500">
                {files.filter(f => f.uploadStatus !== 'error').length} valid files
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={clearFiles}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={uploadFiles}
                  disabled={!hasValidFiles || uploading}
                  className="min-w-[120px]"
                >
                  {uploading ? (
                    <>
                      <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <IconUpload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {allUploaded && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-center text-green-600">
                <IconCheck className="h-5 w-5 mr-2" />
                <span className="font-medium">All files uploaded successfully</span>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={clearFiles}
                >
                  Upload More Files
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}