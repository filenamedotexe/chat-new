import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/api/adapters';
import { createTask, getTasksByProject } from '@/features/tasks/data/tasks';
import { createActivityLog } from '@/features/timeline/data/activity';
import { ActivityActions, EntityTypes } from '@/packages/database/src/schema/activity';

export async function POST(request: NextRequest) {
  try {
    // Only admins and team members can create tasks
    const session = await requireRole(['admin', 'team_member']);

    const body = await request.json();
    const { projectId, title, description, assignedToId, dueDate } = body;

    // Validate required fields
    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    // Create the task
    const task = await createTask({
      projectId,
      title,
      description: description || undefined,
      assignedToId: assignedToId || undefined,
      createdById: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    // Log the activity
    try {
      await createActivityLog({
        userId: session.user.id,
        userRole: session.user.role,
        userName: session.user.name,
        action: ActivityActions.TASK_CREATED,
        entityType: EntityTypes.TASK,
        entityId: task.id,
        entityName: task.title,
        projectId: projectId,
        taskId: task.id,
        newValues: {
          title: task.title,
          description: task.description,
          status: task.status,
          assignedToId: task.assignedToId,
          dueDate: task.dueDate,
        },
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const tasks = await getTasksByProject(
      projectId,
      session.user.id,
      session.user.role
    );

    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Task fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}