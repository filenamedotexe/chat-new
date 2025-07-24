'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './task-card';
import { TaskForm } from './task-form';
import { Button, Card } from '@chat/ui';
import { IconPlus, IconClipboardList } from '@tabler/icons-react';
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

interface TaskBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskUpdate?: (taskId: string, status: TaskStatus) => Promise<void>;
  loading?: boolean;
  canCreateTasks?: boolean;
}

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'not_started', title: 'Not Started', color: 'border-gray-200 dark:border-gray-700' },
  { status: 'in_progress', title: 'In Progress', color: 'border-blue-200 dark:border-blue-900' },
  { status: 'needs_review', title: 'Needs Review', color: 'border-yellow-200 dark:border-yellow-900' },
  { status: 'done', title: 'Done', color: 'border-green-200 dark:border-green-900' },
];

export function TaskBoard({ 
  tasks, 
  projectId, 
  onTaskUpdate, 
  loading = false,
  canCreateTasks = true 
}: TaskBoardProps) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [creatingInColumn, setCreatingInColumn] = useState<TaskStatus | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const router = useRouter();

  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== status && onTaskUpdate) {
      await onTaskUpdate(draggedTask.id, status);
    }
    
    setDraggedTask(null);
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreatingInColumn(status);
    setShowNewTaskForm(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(column => (
          <div key={column.status} className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <Card className="h-32 animate-pulse bg-muted" />
            <Card className="h-32 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(column => {
          const columnTasks = tasksByStatus[column.status] || [];
          const isDropTarget = dragOverColumn === column.status;
          
          return (
            <div key={column.status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  {column.title} ({columnTasks.length})
                </h3>
                {canCreateTasks && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddTask(column.status)}
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div
                className={`min-h-[200px] space-y-3 p-3 rounded-lg border-2 transition-colors ${
                  column.color
                } ${isDropTarget ? 'bg-muted/50' : ''}`}
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                <AnimatePresence mode="popLayout">
                  {columnTasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8 text-muted-foreground text-sm"
                    >
                      <IconClipboardList className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>No tasks</p>
                    </motion.div>
                  ) : (
                    columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task)}
                        className="cursor-move"
                      >
                        <TaskCard
                          task={task}
                          onClick={() => router.push(`/tasks/${task.id}`)}
                          onStatusChange={onTaskUpdate ? (status) => onTaskUpdate(task.id, status) : undefined}
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewTaskForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-lg shadow-lg max-w-lg w-full"
            >
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
                <TaskForm
                  projectId={projectId}
                  onSuccess={() => {
                    setShowNewTaskForm(false);
                    setCreatingInColumn(null);
                    window.location.reload(); // Simple refresh for now
                  }}
                  onCancel={() => {
                    setShowNewTaskForm(false);
                    setCreatingInColumn(null);
                  }}
                />
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}