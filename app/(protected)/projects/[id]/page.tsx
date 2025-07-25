import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { getProjectWithProgress } from '@/features/projects/data/projects';
import { Button, Card } from '@chat/ui';
import { IconArrowLeft, IconClipboardList, IconCalendar, IconBuilding } from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { UserRole } from '@chat/shared-types';
import { ProgressBar } from '@/features/progress/components/progress-bar';
import { ProgressChecklist } from '@/features/progress/components/progress-checklist';
import { ProjectDetailActions } from '@/features/projects/components/project-detail-actions';
import { checkFeature, FEATURES } from '@/lib/features/featureFlags';
import { AnalyticsSection } from './analytics-section';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const projectData = await getProjectWithProgress(params.id, session.user.id, session.user.role as UserRole);
  
  if (!projectData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Link href="/projects">
          <Button variant="outline">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const { project, organization, progress } = projectData;
  const canEdit = session.user.role === 'admin' || session.user.role === 'team_member';
  const analyticsEnabled = await checkFeature(FEATURES.ADVANCED_ANALYTICS);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <IconBuilding className="h-4 w-4" />
                <span>{organization?.name || 'Unknown'}</span>
              </div>
              {project.startDate && (
                <div className="flex items-center gap-1">
                  <IconCalendar className="h-4 w-4" />
                  <span>Started {format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/projects/${params.id}/tasks`}>
              <Button>
                <IconClipboardList className="h-4 w-4 mr-2" />
                View Tasks
              </Button>
            </Link>
            {canEdit && (
              <Link href={`/projects/${params.id}/edit`}>
                <Button variant="outline">
                  Edit Project
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 mb-6">
        <ProgressBar progress={progress} size="lg" />
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">
            {project.description || 'No description provided'}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : project.status === 'completed'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}>
            {project.status}
          </span>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Timeline</h3>
          <div className="space-y-1 text-sm">
            {project.startDate && (
              <p>Start: {format(new Date(project.startDate), 'MMM d, yyyy')}</p>
            )}
            {project.endDate && (
              <p>End: {format(new Date(project.endDate), 'MMM d, yyyy')}</p>
            )}
            {!project.startDate && !project.endDate && (
              <p className="text-muted-foreground">No timeline set</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-4">
        <ProjectDetailActions 
          project={project}
          progress={progress}
          canEdit={canEdit}
        />

        {/* Advanced Analytics Section */}
        {analyticsEnabled && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>
            <AnalyticsSection project={project} progress={progress} />
          </div>
        )}

        {/* Detailed Progress Checklist */}
        <Card className="p-6">
          <ProgressChecklist 
            progress={progress} 
            projectName={project.name}
            showRules={true}
          />
        </Card>
      </div>
    </div>
  );
}