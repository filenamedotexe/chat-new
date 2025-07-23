'use client';

import { useState } from 'react';
import { TaskBoard } from './task-board';
import { useRouter } from 'next/navigation';
import type { TaskStatus } from '../data/tasks';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: Date | string | null;
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface TaskBoardWrapperProps {
  initialTasks: Task[];
  projectId: string;
  canCreateTasks?: boolean;
}

export function TaskBoardWrapper({ 
  initialTasks, 
  projectId, 
  canCreateTasks = true 
}: TaskBoardWrapperProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTaskUpdate = async (taskId: string, newStatus: TaskStatus) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }

      const result = await response.json();
      
      // Update local state optimistically
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Show success message (could use toast here)
      console.log(result.message);
      
      // Refresh to get latest data
      router.refresh();
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert optimistic update
      setTasks(initialTasks);
      alert(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskBoard 
      tasks={tasks} 
      projectId={projectId}
      onTaskUpdate={handleTaskUpdate}
      loading={loading}
      canCreateTasks={canCreateTasks}
    />
  );
}