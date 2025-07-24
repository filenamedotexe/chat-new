import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { getProjectById } from '@/features/projects/data/projects';
import { Button, Card } from '@chat/ui';
import { IconArrowLeft, IconDownload, IconTrash, IconFile } from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { UserRole } from '@chat/shared-types';
import { db } from '@chat/database';
import { files } from '@chat/database';
import { eq } from 'drizzle-orm';
import { FileUploadWrapper } from '@/features/files/components/file-upload-wrapper';

interface ProjectFilesPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectFilesPage({ params }: ProjectFilesPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const projectData = await getProjectById(params.id, session.user.id, session.user.role as UserRole);
  
  if (!projectData) {
    redirect('/projects');
  }

  const { project } = projectData;
  const canUpload = session.user.role === 'admin' || session.user.role === 'team_member';

  // Get all files for this project
  const projectFiles = await db
    .select()
    .from(files)
    .where(eq(files.projectId, params.id))
    .orderBy(files.createdAt);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/projects/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name} - Files</h1>
            <p className="text-muted-foreground mt-2">
              Manage files for this project
            </p>
          </div>
        </div>
      </div>

      {canUpload && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
          <FileUploadWrapper projectId={params.id} />
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Project Files ({projectFiles.length})</h2>
        
        {projectFiles.length === 0 ? (
          <Card className="p-8 text-center">
            <IconFile className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No files yet</h3>
            <p className="text-muted-foreground">
              {canUpload ? 'Upload files to get started.' : 'No files have been uploaded to this project yet.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projectFiles.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconFile className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{file.originalName}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}</span>
                        <span>•</span>
                        <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                        {file.taskId && (
                          <>
                            <span>•</span>
                            <Link href={`/tasks/${file.taskId}`} className="text-primary hover:underline">
                              View Task
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/uploads/${file.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.originalName}
                    >
                      <Button variant="ghost" size="sm">
                        <IconDownload className="h-4 w-4" />
                      </Button>
                    </a>
                    {canUpload && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}