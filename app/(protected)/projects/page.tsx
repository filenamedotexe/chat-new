import { auth } from '@/lib/auth/auth.config';
import { ProjectList } from '@/features/projects/components/project-list';
import { Button } from '@chat/ui';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ProjectsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const canCreateProjects = session.user.role === 'admin' || session.user.role === 'team_member';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        {canCreateProjects && (
          <Link href="/projects/new">
            <Button>Create Project</Button>
          </Link>
        )}
      </div>
      
      <ProjectList userId={session.user.id} userRole={session.user.role} />
    </div>
  );
}