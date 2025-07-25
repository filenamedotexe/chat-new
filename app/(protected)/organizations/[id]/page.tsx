import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { getOrganizationById } from '@/features/organizations/data/organizations';
import { getProjectsByOrganization } from '@/features/projects/data/projects';
import { Button, Card } from '@chat/ui';
import { IconArrowLeft, IconPlus, IconUsers, IconBriefcase, IconMail, IconFiles } from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { db } from '@chat/database';
import { files } from '@chat/database';
import { inArray } from 'drizzle-orm';

interface OrganizationPageProps {
  params: {
    id: string;
  };
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Clients shouldn't access organization pages
  if (session.user.role === 'client') {
    redirect('/dashboard');
  }

  const organization = await getOrganizationById(params.id);
  
  if (!organization) {
    return (
      <div className="mx-auto max-w-7xl py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Organization not found</h1>
        <Link href="/organizations">
          <Button variant="outline">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </Link>
      </div>
    );
  }

  // Get projects for this organization
  const projects = await getProjectsByOrganization(params.id);
  
  // Get all files from all projects in this organization
  const projectIds = projects.map(p => p.project.id);
  const organizationFiles = projectIds.length > 0 
    ? await db
        .select()
        .from(files)
        .where(inArray(files.projectId, projectIds))
        .orderBy(files.createdAt)
        .limit(10) // Show latest 10 files
    : [];

  return (
    <div className="mx-auto max-w-7xl py-8 px-4">
      <div className="mb-6">
        <Link href="/organizations">
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground mt-2">
              {organization.type === 'client' ? 'Client Organization' : 'Internal Team'}
            </p>
          </div>
          
          <Link href={`/organizations/${params.id}/edit`}>
            <Button variant="outline">
              Edit Organization
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <IconBriefcase className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Type</h3>
          </div>
          <p className="capitalize">{organization.type}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <IconUsers className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Projects</h3>
          </div>
          <p>{projects.length} active projects</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <IconMail className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Contact</h3>
          </div>
          <p className="text-sm">{organization.contactEmail || 'No email set'}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <IconFiles className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Files</h3>
          </div>
          <p>{organizationFiles.length} files across all projects</p>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Link href="/projects/new">
            <Button>
              <IconPlus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project for this organization.
            </p>
            <Link href="/projects/new">
              <Button>Create Project</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(({ project }) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {project.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                    {project.startDate && (
                      <span className="text-muted-foreground">
                        {format(new Date(project.startDate), 'MMM yyyy')}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Files Section */}
      {organizationFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Files</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizationFiles.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{file.originalName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </p>
                    {file.projectId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        From: {projects.find(p => p.project.id === file.projectId)?.project.name || 'Unknown project'}
                      </p>
                    )}
                  </div>
                  <a
                    href={`/uploads/${file.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2"
                  >
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
          {organizationFiles.length === 10 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 10 most recent files
            </p>
          )}
        </div>
      )}
    </div>
  );
}