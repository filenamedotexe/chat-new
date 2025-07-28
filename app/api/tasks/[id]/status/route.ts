import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { updateTaskStatus, getTaskById, TASK_STATUS_TRANSITIONS, type TaskStatus } from '@/features/tasks/data/tasks';
import { logTaskStatusChange } from '@/features/activities/data/activities';
import type { UserRole } from '@chat/shared-types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    
    if (error) {
      return error;
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get the current task
    const task = await getTaskById(params.id, user.id, user.role as UserRole);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if user can update this task
    if (user.role === 'client') {
      return NextResponse.json({ error: 'Clients cannot update tasks' }, { status: 403 });
    }

    // Validate status transition
    const currentStatus = task.task.status as TaskStatus;
    const allowedTransitions = TASK_STATUS_TRANSITIONS[currentStatus];
    
    if (!allowedTransitions.includes(status as TaskStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Update the task status
    const updatedTask = await updateTaskStatus(
      params.id,
      status as TaskStatus,
      user.id,
      user.role as UserRole
    );

    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Log activity
    await logTaskStatusChange(
      user.id,
      params.id,
      task.project?.id || '',
      currentStatus,
      status
    );

    return NextResponse.json({ 
      success: true, 
      task: updatedTask,
      message: `Task moved to ${status.replace('_', ' ')}`
    });
  } catch (error) {
    console.error('Task status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}