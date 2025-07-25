import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { getTaskById } from '@/features/tasks/data/tasks';
import { Button } from '@chat/ui';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import type { UserRole } from '@chat/shared-types';
import { ChatContainer } from '@/features/chat/components/chat-container';

interface TaskChatPageProps {
  params: {
    id: string;
  };
}

export default async function TaskChatPage({ params }: TaskChatPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const taskData = await getTaskById(params.id, session.user.id, session.user.role as UserRole);
  
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
          
          <h1 className="text-3xl font-bold">{task.title} - Discussion</h1>
          <p className="text-muted-foreground mt-2">
            Task-specific comments and updates
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 min-h-0">
          <ChatContainer
            taskId={params.id}
            currentUserId={session.user.id}
            title="Task Comments"
            subtitle="Discuss progress and updates"
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}