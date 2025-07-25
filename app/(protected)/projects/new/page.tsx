import { auth } from '@/lib/auth/auth.config';
import { redirect } from 'next/navigation';
import { ProjectForm } from '@/features/projects/components/project-form';
import { getOrganizations } from '@/features/organizations/data/organizations';
import type { UserRole } from '@chat/shared-types';

export default async function NewProjectPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Only admins and team members can create projects
  if (session.user.role !== 'admin' && session.user.role !== 'team_member') {
    redirect('/projects');
  }

  const organizations = await getOrganizations(session.user.id, session.user.role as UserRole);

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      
      <ProjectForm 
        organizations={organizations} 
        userRole={session.user.role}
      />
    </div>
  );
}