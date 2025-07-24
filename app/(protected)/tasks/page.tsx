import { auth } from '@/lib/auth/auth.config';
import { redirect } from 'next/navigation';
import { getAllUserTasks } from '@/features/tasks/data/tasks';
import { TaskList } from '@/features/tasks/components/task-list';
import { Card } from '@chat/ui';
import { IconClipboardList } from '@tabler/icons-react';
import type { UserRole } from '@chat/shared-types';

export default async function TasksPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const tasks = await getAllUserTasks(session.user.id, session.user.role as UserRole);
  
  // Transform tasks to match component interface
  const formattedTasks = tasks.map(({ task, assignee, fileCount }) => ({
    ...task,
    assignee: assignee?.id ? assignee : null,
    fileCount: fileCount || 0,
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <IconClipboardList className="h-8 w-8" />
          My Tasks
        </h1>
        <p className="text-muted-foreground mt-2">
          All tasks assigned to you across all projects
        </p>
      </div>

      {formattedTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <IconClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
          <p className="text-muted-foreground">
            You don&apos;t have any tasks assigned to you yet.
          </p>
        </Card>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {formattedTasks.length} task{formattedTasks.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <TaskList 
            tasks={formattedTasks}
            emptyMessage="No tasks found"
          />
        </div>
      )}
    </div>
  );
}