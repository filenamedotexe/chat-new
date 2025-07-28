import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';
import { ProjectForm } from '@/features/projects/components/project-form';
import { getOrganizations } from '@/features/organizations/data/organizations';
import type { UserRole } from '@chat/shared-types';

export default async function NewProjectPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Only admins and team members can create projects
  if (user.role !== 'admin' && user.role !== 'team_member') {
    redirect('/projects');
  }

  const organizations = await getOrganizations(user.id, user.role as UserRole);

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      
      <ProjectForm 
        organizations={organizations} 
        userRole={user.role}
      />
    </div>
  );
}