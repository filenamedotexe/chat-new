'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@chat/ui';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { 
  IconClipboardList, 
  IconFiles, 
  IconMessage, 
  IconProgress,
  IconCalendar,
  IconBuilding
} from '@tabler/icons-react';
import type { Project, Organization } from '@chat/shared-types';
import type { ProjectProgress } from '@/features/progress/lib/calculate-progress';
import { CompactProgressBar } from '@/features/progress/components/progress-bar';

interface ProjectWithStats {
  project: Project;
  organization: Organization | null;
  taskCount: number;
  completedTaskCount: number;
  fileCount: number;
  progress?: ProjectProgress;
}

interface ProjectListEnhancedProps {
  userId: string;
  userRole: string;
}

export function ProjectListEnhanced({ userId, userRole }: ProjectListEnhancedProps) {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects/with-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-64 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">Error: {error}</p>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground">
          {userRole === 'admin' || userRole === 'team_member' 
            ? 'Create your first project to get started.'
            : 'No projects have been assigned to your organization yet.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((projectData) => {
        const { project, organization, taskCount, completedTaskCount, fileCount, progress: progressData } = projectData;
        const progress = progressData?.progressPercentage ?? getProgressPercentage(completedTaskCount, taskCount);
        
        return (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
            {/* Header */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold line-clamp-1">{project.name}</h3>
                  {organization && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <IconBuilding className="h-3 w-3" />
                      <span>{organization.name}</span>
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : project.status === 'completed'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {project.status}
                </span>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <IconClipboardList className="h-3 w-3" />
                    <span>Tasks</span>
                  </div>
                  <p className="text-lg font-semibold">{taskCount}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <IconProgress className="h-3 w-3" />
                    <span>Progress</span>
                  </div>
                  <p className="text-lg font-semibold">{progress}%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                    <IconFiles className="h-3 w-3" />
                    <span>Files</span>
                  </div>
                  <p className="text-lg font-semibold">{fileCount}</p>
                </div>
              </div>

              {/* Progress Bar */}
              {taskCount > 0 && progressData && (
                <div className="mb-4">
                  <CompactProgressBar progress={progressData} />
                </div>
              )}
            </div>

            {/* Footer with Actions */}
            <div className="mt-auto pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                {project.startDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconCalendar className="h-3 w-3" />
                    <span>{format(new Date(project.startDate), 'MMM yyyy')}</span>
                  </div>
                )}
                <Link href={`/projects/${project.id}`}>
                  <Button variant="ghost" size="sm">
                    View Details →
                  </Button>
                </Link>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/projects/${project.id}/tasks`);
                  }}
                  className="text-xs"
                >
                  <IconClipboardList className="h-3 w-3" />
                  Tasks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/projects/${project.id}/files`);
                  }}
                  className="text-xs"
                >
                  <IconFiles className="h-3 w-3" />
                  Files
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/projects/${project.id}/chat`);
                  }}
                  className="text-xs"
                >
                  <IconMessage className="h-3 w-3" />
                  Chat
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}