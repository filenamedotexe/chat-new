'use client';

import { useState } from 'react';

interface UploadedFile {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
}

interface UseFileUploadResult {
  uploadFiles: (conversationId: string, files: File[]) => Promise<UploadedFile[]>;
  isUploading: boolean;
  uploadError: string | null;
}

export function useFileUpload(): UseFileUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFiles = async (conversationId: string, files: File[]): Promise<UploadedFile[]> => {
    if (!files.length) return [];

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/conversations/${conversationId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map((e: any) => `${e.fileName}: ${e.error}`).join(', ');
        setUploadError(`Some files failed: ${errorMessages}`);
      }

      return data.files || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFiles,
    isUploading,
    uploadError,
  };
}