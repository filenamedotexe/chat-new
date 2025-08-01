import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { updateProject, getProjectById } from '@/features/projects/data/projects';
import { UserRole } from '@chat/shared-types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    
    if (error) {
      return error;
    }

    // Only admins and team members can update projects
    if (user.role !== 'admin' && user.role !== 'team_member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (status && !['active', 'completed', 'on_hold'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get the project to check ownership
    const project = await getProjectById(params.id, user.id, user.role as UserRole);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update the project
    const updated = await updateProject(params.id, { status });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}