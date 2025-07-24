import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { db } from '@chat/database';
import { tasks } from '@chat/database';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and team members can update tasks
    if (session.user.role === 'client') {
      return NextResponse.json({ error: 'Clients cannot update tasks' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, assignedToId, dueDate, status } = body;

    // Update the task
    const updatedTask = await db
      .update(tasks)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, params.id))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and team members can delete tasks
    if (session.user.role === 'client') {
      return NextResponse.json({ error: 'Clients cannot delete tasks' }, { status: 403 });
    }

    // Delete the task
    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, params.id))
      .returning();

    if (deletedTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}