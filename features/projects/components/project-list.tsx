'use client';

import { useEffect, useState } from 'react';
import { Card } from '@chat/ui';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Project, Organization } from '@chat/shared-types';

interface ProjectWithOrg {
  project: Project;
  organization: Organization | null;
}

interface ProjectListProps {
  userId: string;
  userRole: string;
}

export function ProjectList({ userId, userRole }: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectWithOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-48 animate-pulse bg-muted" />
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
      {projects.map(({ project, organization }) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                {organization && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {organization.name}
                  </p>
                )}
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.description}
                  </p>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
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
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}