import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
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
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Only admins and team members can edit tasks
  if (session.user.role === 'client') {
    redirect(`/tasks/${params.id}`);
  }

  const taskData = await getTaskById(
    params.id,
    session.user.id,
    session.user.role as UserRole
  );
  
  if (!taskData) {
    redirect('/dashboard');
  }

  const { task, project } = taskData;

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
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