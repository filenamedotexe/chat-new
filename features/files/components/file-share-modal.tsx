'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@chat/ui';
import { 
  IconX, 
  IconShare, 
  IconFolder, 
  IconTag,
  IconLoader2 
} from '@tabler/icons-react';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  project: {
    id: string;
    name: string;
  };
}

interface FileShareModalProps {
  fileId: string;
  fileName: string;
  currentProjectId?: string;
  currentTaskId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FileShareModal({
  fileId,
  fileName,
  currentProjectId,
  currentTaskId,
  isOpen,
  onClose,
  onSuccess
}: FileShareModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId || '');
  const [selectedTaskId, setSelectedTaskId] = useState(currentTaskId || '');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects and tasks
  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      try {
        setLoadingData(true);
        
        // Load projects
        const projectsResponse = await fetch('/api/projects');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        }

        // Load tasks (optional - could be loaded based on selected project)
        // For now, we'll just allow project-level sharing
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load projects');
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [isOpen]);

  const handleShare = async () => {
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/files/${fileId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          taskId: selectedTaskId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to share file');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share file');
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/files/${fileId}/share`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unshare file');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unshare file');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconShare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Share File</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {fileName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <IconX className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Share to Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  disabled={loading}
                >
                  <option value="">Select a project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Association Display */}
              {(currentProjectId || currentTaskId) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Currently associated with:
                  </p>
                  <div className="space-y-1">
                    {currentProjectId && (
                      <div className="flex items-center gap-2 text-sm">
                        <IconFolder className="h-3 w-3" />
                        <span>Project: {projects.find(p => p.id === currentProjectId)?.name || 'Unknown'}</span>
                      </div>
                    )}
                    {currentTaskId && (
                      <div className="flex items-center gap-2 text-sm">
                        <IconTag className="h-3 w-3" />
                        <span>Task: {currentTaskId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-gray-50 dark:bg-gray-900/30">
          <div>
            {(currentProjectId || currentTaskId) && (
              <Button
                variant="outline"
                onClick={handleUnshare}
                disabled={loading}
              >
                {loading && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
                Unshare
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={loading || !selectedProjectId}>
              {loading && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
              Share File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}