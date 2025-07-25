import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { getProjectById } from '@/features/projects/data/projects';
import { Button, Card } from '@chat/ui';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import type { UserRole } from '@chat/shared-types';
import { EditProjectForm } from './edit-project-form';

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Only admins and team members can edit projects
  if (session.user.role === 'client') {
    redirect('/projects');
  }

  const projectData = await getProjectById(params.id, session.user.id, session.user.role as UserRole);
  
  if (!projectData) {
    redirect('/projects');
  }

  const { project } = projectData;

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6">
        <Link href={`/projects/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground mt-2">
          Update project details
        </p>
      </div>

      <Card className="p-6">
        <EditProjectForm project={project} />
      </Card>
    </div>
  );
}