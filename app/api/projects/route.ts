import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/api/adapters';
import { createProject, getProjects } from '@/features/projects/data/projects';
import { getOrganizations } from '@/features/organizations/data/organizations';
import { createActivityLog } from '@/features/timeline/data/activity';
import { ActivityActions, EntityTypes } from '@/packages/database/src/schema/activity';

export async function GET() {
  try {
    const session = await requireAuth();
    const projects = await getProjects(session.user.id, session.user.role);
    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admins and team members can create projects
    const session = await requireRole(['admin', 'team_member']);

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.organizationId) {
      return NextResponse.json(
        { error: 'Name and organization are required' },
        { status: 400 }
      );
    }

    // Verify the organization exists and user has access
    const orgs = await getOrganizations(session.user.id, session.user.role);
    const orgExists = orgs.some(o => o.id === body.organizationId);
    
    if (!orgExists) {
      return NextResponse.json(
        { error: 'Invalid organization' },
        { status: 400 }
      );
    }

    const project = await createProject({
      organizationId: body.organizationId,
      name: body.name,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });

    // Log the activity
    try {
      await createActivityLog({
        userId: session.user.id,
        userRole: session.user.role,
        userName: session.user.name,
        action: ActivityActions.PROJECT_CREATED,
        entityType: EntityTypes.PROJECT,
        entityId: project.id,
        entityName: project.name,
        projectId: project.id,
        organizationId: body.organizationId,
        newValues: {
          name: project.name,
          description: project.description,
          organizationId: project.organizationId,
          status: project.status,
        },
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}