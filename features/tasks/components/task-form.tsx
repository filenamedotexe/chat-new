'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Card } from '@chat/ui';
import type { TaskStatus } from '../data/tasks';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface TaskFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingTask?: {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    assignedToId?: string | null;
    dueDate?: Date | string | null;
  };
}

export function TaskForm({ projectId, onSuccess, onCancel, existingTask }: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [formData, setFormData] = useState({
    title: existingTask?.title || '',
    description: existingTask?.description || '',
    assignedToId: existingTask?.assignedToId || '',
    status: existingTask?.status || 'not_started',
    dueDate: existingTask?.dueDate 
      ? new Date(existingTask.dueDate).toISOString().split('T')[0] 
      : '',
  });

  // Load users for assignment dropdown
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = existingTask 
        ? `/api/tasks/${existingTask.id}`
        : '/api/tasks';
      
      const method = existingTask ? 'PATCH' : 'POST';
      
      const body = existingTask 
        ? {
            title: formData.title,
            description: formData.description || null,
            assignedToId: formData.assignedToId || null,
            status: formData.status,
            dueDate: formData.dueDate || null,
          }
        : { 
            title: formData.title,
            description: formData.description || null,
            assignedToId: formData.assignedToId || null,
            dueDate: formData.dueDate || null,
            projectId 
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save task');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Task Title *
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter task title"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="assignedToId" className="block text-sm font-medium mb-2">
            Assign To
          </label>
          <select
            id="assignedToId"
            name="assignedToId"
            value={formData.assignedToId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md bg-background"
            disabled={loadingUsers}
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
            Due Date
          </label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Status field - only show for existing tasks */}
      {existingTask && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="needs_review">Needs Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}

      {/* File Upload Section */}
      <div className="space-y-4">
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Attachments</h3>
          {/* File upload component will be added here after task creation */}
          <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
            <p className="text-sm">Files can be attached after the task is created</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" loading={loading}>
          {loading ? 'Saving...' : existingTask ? 'Update Task' : 'Create Task'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}