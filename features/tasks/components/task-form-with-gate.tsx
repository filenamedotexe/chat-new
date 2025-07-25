'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@chat/ui';
import { TaskForm } from './task-form';
import { ActionGate } from '@/features/requirements/components/action-gate';
import { checkTaskCanBeCreated } from '@/features/requirements/lib/requirements';
import { IconFolderOpen } from '@tabler/icons-react';

interface Project {
  id: string;
  name: string;
  organizationName?: string;
}

interface TaskFormWithGateProps {
  projects: Project[];
}

export function TaskFormWithGate({ projects }: TaskFormWithGateProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const requirement = checkTaskCanBeCreated(selectedProjectId);

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(e.target.value);
  };

  const handleSuccess = () => {
    if (selectedProjectId) {
      router.push(`/projects/${selectedProjectId}/tasks`);
    } else {
      router.push('/tasks');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Project Selection Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <IconFolderOpen className="h-6 w-6 text-muted-foreground mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Select Project</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tasks must be associated with a project. Choose the project this task belongs to.
            </p>
            <select
              value={selectedProjectId}
              onChange={handleProjectSelect}
              className="w-full px-3 py-2 border rounded-md bg-background"
              autoFocus
            >
              <option value="">-- Select a project --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.organizationName && ` (${project.organizationName})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Action Gate - Shows requirement message if no project selected */}
      <ActionGate 
        requirement={requirement}
        showBlockedUI={true}
      >
        {/* Task Form - Only shows when project is selected */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Task Details</h3>
          <TaskForm 
            projectId={selectedProjectId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Card>
      </ActionGate>

      {/* Help Text */}
      {projects.length === 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            No projects found. You need to create a project first before you can add tasks.
          </p>
        </Card>
      )}
    </div>
  );
}