import { Main, PageContainer } from '@chat/ui';
import { FileList } from '@/features/files/components/file-list';
import { FileUpload } from '@/features/files/components/file-upload';
import { Suspense } from 'react';
import { getUser } from '@/lib/auth/get-user';
import { hasPermission } from '@/lib/auth/permissions';

export default async function FilesPage() {
  const user = await getUser();
  const canUpload = user?.role ? hasPermission(user.role, 'uploadFiles') : false;

  return (
    <Main>
      <PageContainer>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-2)' }}>Files</h1>
          <p className="text-muted-foreground">
            {canUpload ? 'Manage and share files across your projects' : 'View files shared with you'}
          </p>
        </div>
        
        {canUpload ? (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <FileUpload />
          </div>
        ) : (
          <div style={{ marginBottom: 'var(--space-6)' }} className="p-4 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground text-center">
              📁 File uploads are restricted to admin and team members only.
              <br />
              You can view and download files that have been shared with you.
            </p>
          </div>
        )}
        
        <Suspense fallback={<div>Loading files...</div>}>
          <FileList />
        </Suspense>
      </PageContainer>
    </Main>
  );
}