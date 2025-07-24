import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { getTaskById } from '@/features/tasks/data/tasks';
import { TaskDetailWrapper } from './task-detail-wrapper';
import type { UserRole } from '@chat/shared-types';

interface TaskPageProps {
  params: {
    id: string;
  };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const taskData = await getTaskById(
    params.id,
    session.user.id,
    session.user.role as UserRole
  );
  
  if (!taskData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Task not found</h1>
          <p className="text-gray-600 mb-4">
            The task you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const canEdit = session.user.role === 'admin' || session.user.role === 'team_member';

  // Transform the data to match TaskDetail interface
  const task = {
    ...taskData.task,
    assignee: taskData.assignee?.id ? taskData.assignee : null,
    project: taskData.project!,
    createdBy: taskData.createdBy!,
    fileCount: taskData.fileCount || 0,
    createdAt: taskData.task.createdAt.toISOString(),
    updatedAt: taskData.task.updatedAt.toISOString(),
    dueDate: taskData.task.dueDate?.toISOString() || null,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <TaskDetailWrapper
        task={task}
        canEdit={canEdit}
      />
    </div>
  );
}