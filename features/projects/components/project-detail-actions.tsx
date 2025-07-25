'use client';

import React from 'react';
import { Button, Card } from '@chat/ui';
import { IconCheck, IconClipboardList, IconFiles, IconMessage } from '@tabler/icons-react';
import Link from 'next/link';
import { ActionGate, TooltipActionGate } from '@/features/requirements/components/action-gate';
import { checkProjectCanBeCompleted } from '@/features/requirements/lib/requirements';
import { useRouter } from 'next/navigation';

interface ProjectDetailActionsProps {
  project: any;
  progress: any;
  canEdit: boolean;
}

export function ProjectDetailActions({ project, progress, canEdit }: ProjectDetailActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  // Create a project object with the required fields for requirement checking
  const projectForCheck = {
    ...project,
    taskCount: progress.total,
    progress
  };
  
  const completionRequirement = checkProjectCanBeCompleted(projectForCheck);

  const handleMarkComplete = async () => {
    if (!completionRequirement.passed) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update project status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update project status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Quick Actions Card */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href={`/projects/${project.id}/tasks`}>
            <Button size="lg" className="flex-1">
              <IconClipboardList className="h-5 w-5 mr-2" />
              Manage Tasks
            </Button>
          </Link>
          <Link href={`/projects/${project.id}/files`} className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              <IconFiles className="h-5 w-5 mr-2" />
              View Files
            </Button>
          </Link>
          <Link href={`/projects/${project.id}/chat`} className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              <IconMessage className="h-5 w-5 mr-2" />
              Team Chat
            </Button>
          </Link>
        </div>
      </Card>

      {/* Project Completion Actions - Only show for admins/team members */}
      {canEdit && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Project Status</h3>
          
          {project.status === 'active' ? (
            <ActionGate 
              requirement={completionRequirement}
              className="mb-4"
            >
              <Button 
                onClick={handleMarkComplete}
                disabled={isUpdating}
                className="w-full"
              >
                <IconCheck className="h-5 w-5 mr-2" />
                {isUpdating ? 'Updating...' : 'Mark Project as Complete'}
              </Button>
            </ActionGate>
          ) : project.status === 'completed' ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  This project was completed with all {progress.total} tasks done!
                </p>
              </div>
              <Button 
                onClick={handleReactivate}
                disabled={isUpdating}
                variant="outline"
                className="w-full"
              >
                {isUpdating ? 'Updating...' : 'Reactivate Project'}
              </Button>
            </div>
          ) : null}
        </Card>
      )}
    </>
  );
}