'use client';

import { useRouter } from 'next/navigation';
import { FileUpload } from './file-upload';

interface FileUploadWrapperProps {
  projectId: string;
}

export function FileUploadWrapper({ projectId }: FileUploadWrapperProps) {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Refresh the page to show new files
    router.refresh();
  };

  return (
    <FileUpload 
      projectId={projectId}
      onUploadComplete={handleUploadComplete}
    />
  );
}