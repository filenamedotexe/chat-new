import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import { getTaskById } from '@/features/tasks/data/tasks';
import { Button } from '@chat/ui';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import type { UserRole } from '@chat/shared-types';
import { UniversalChat } from '@/components/chat/UniversalChat';

interface TaskCommentsPageProps {
  params: {
    id: string;
  };
}

export default async function TaskCommentsPage({ params }: TaskCommentsPageProps) {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  const taskData = await getTaskById(params.id, user.id, user.role as UserRole);
  
  if (!taskData) {
    redirect('/projects');
  }

  const { task } = taskData;

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/tasks/${params.id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Task
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold">{task.title} - Comments</h1>
          <p className="text-muted-foreground mt-2">
            Task-specific comments and updates
          </p>
        </div>

        {/* Comments Container */}
        <div className="flex-1 min-h-0">
          <UniversalChat
            type="task"
            taskId={params.id}
            currentUserId={user.id}
            title="Task Comments"
            subtitle="Discuss progress and updates"
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}