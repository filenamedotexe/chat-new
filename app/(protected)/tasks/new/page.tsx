import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';
import { getProjects } from '@/features/projects/data/projects';
import { UserRole } from '@chat/shared-types';
import { TaskFormWithGate } from '@/features/tasks/components/task-form-with-gate';

export default async function NewTaskPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Only admins and team members can create tasks
  if (user.role !== 'admin' && user.role !== 'team_member') {
    redirect('/tasks');
  }

  // Get projects for the project selector
  const projects = await getProjects(user.id, user.role as UserRole);

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Task</h1>
      
      <TaskFormWithGate 
        projects={projects.map(p => ({
          id: p.project.id,
          name: p.project.name,
          organizationName: p.organization?.name
        }))}
      />
    </div>
  );
}