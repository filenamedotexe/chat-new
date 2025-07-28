import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import { getTaskById } from '@/features/tasks/data/tasks';
import { TaskForm } from '@/features/tasks/components/task-form';
import { Button, Card } from '@chat/ui';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import type { UserRole } from '@chat/shared-types';

interface EditTaskPageProps {
  params: {
    id: string;
  };
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Only admins and team members can edit tasks
  if (user.role === 'client') {
    redirect(`/tasks/${params.id}`);
  }

  const taskData = await getTaskById(
    params.id,
    user.id,
    user.role as UserRole
  );
  
  if (!taskData) {
    redirect('/dashboard');
  }

  const { task, project } = taskData;

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6">
        <Link href={`/tasks/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Task
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold">Edit Task</h1>
        <p className="text-muted-foreground mt-2">
          Update task details
        </p>
      </div>

      <Card className="p-6">
        <TaskForm 
          projectId={project!.id}
          existingTask={{
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            assignedToId: task.assignedToId,
            dueDate: task.dueDate,
          }}
        />
      </Card>
    </div>
  );
}