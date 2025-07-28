import { Main, PageContainer } from '@chat/ui';
import { FileList } from '@/features/files/components/file-list';
import { FileUpload } from '@/features/files/components/file-upload';
import { Suspense } from 'react';

export default function FilesPage() {
  return (
    <Main>
      <PageContainer>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-2)' }}>Files</h1>
          <p className="text-muted-foreground">
            Manage and share files across your projects
          </p>
        </div>
        
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <FileUpload />
        </div>
        
        <Suspense fallback={<div>Loading files...</div>}>
          <FileList />
        </Suspense>
      </PageContainer>
    </Main>
  );
}