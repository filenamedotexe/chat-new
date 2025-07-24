import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { getTasksByProject } from '@/features/tasks/data/tasks';
import { getProjectById } from '@/features/projects/data/projects';
import { TaskBoardWrapper } from '@/features/tasks/components/task-board-wrapper';
import { Button } from '@chat/ui';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import type { UserRole } from '@chat/shared-types';

interface TasksPageProps {
  params: {
    id: string;
  };
}

export default async function TasksPage({ params }: TasksPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const project = await getProjectById(params.id, session.user.id, session.user.role as UserRole);
  
  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Link href="/projects">
          <Button variant="outline">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const tasks = await getTasksByProject(
    params.id, 
    session.user.id, 
    session.user.role as UserRole
  );

  const canCreateTasks = session.user.role === 'admin' || session.user.role === 'team_member';

  // Transform tasks to match component interface
  const formattedTasks = tasks.map(({ task, assignee, fileCount }) => ({
    ...task,
    assignee: assignee?.id ? assignee : null,
    fileCount: fileCount || 0,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate?.toISOString() || null,
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.project.name}</h1>
            <p className="text-muted-foreground">
              {project.organization?.name || 'Unknown'} • Tasks Board
            </p>
          </div>
        </div>
      </div>

      <TaskBoardWrapper 
        initialTasks={formattedTasks} 
        projectId={params.id}
        canCreateTasks={canCreateTasks}
      />
    </div>
  );
}