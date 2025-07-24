import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { updateTaskStatus, getTaskById, TASK_STATUS_TRANSITIONS, type TaskStatus } from '@/features/tasks/data/tasks';
import { logTaskStatusChange } from '@/features/activities/data/activities';
import type { UserRole } from '@chat/shared-types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get the current task
    const task = await getTaskById(params.id, session.user.id, session.user.role as UserRole);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if user can update this task
    if (session.user.role === 'client') {
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
      session.user.id,
      session.user.role as UserRole
    );

    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Log activity
    await logTaskStatusChange(
      session.user.id,
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