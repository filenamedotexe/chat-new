import { getUser } from '@/lib/auth/get-user';
import { ProjectListEnhanced } from '@/features/projects/components/project-list-enhanced';
import { Button } from '@chat/ui';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { IconPlus } from '@tabler/icons-react';

export default async function ProjectsPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  const canCreateProjects = user.role === 'admin' || user.role === 'team_member';

  return (
    <div className="mx-auto max-w-7xl py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your projects in one place
          </p>
        </div>
        {canCreateProjects && (
          <Link href="/projects/new">
            <Button>
              <IconPlus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </Link>
        )}
      </div>
      
      <ProjectListEnhanced userId={user.id} userRole={user.role} />
    </div>
  );
}