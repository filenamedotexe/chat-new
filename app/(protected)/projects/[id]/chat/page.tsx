import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { getProjectById } from '@/features/projects/data/projects';
import { Button } from '@chat/ui';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import type { UserRole } from '@chat/shared-types';
import { UniversalChat } from '@/components/chat/UniversalChat';

interface ProjectChatPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectChatPage({ params }: ProjectChatPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const projectData = await getProjectById(params.id, session.user.id, session.user.role as UserRole);
  
  if (!projectData) {
    redirect('/projects');
  }

  const { project, organization } = projectData;

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/projects/${params.id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold">{project.name} - Chat</h1>
          <p className="text-muted-foreground mt-2">
            Collaborate with your team in real-time
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 min-h-0">
          <UniversalChat
            type="project"
            projectId={params.id}
            currentUserId={session.user.id}
            title="Project Chat"
            subtitle={`${organization?.name || 'Project'} team discussion`}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}