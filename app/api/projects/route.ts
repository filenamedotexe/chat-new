import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { createProject, getProjects } from '@/features/projects/data/projects';
import { getOrganizations } from '@/features/organizations/data/organizations';
import type { UserRole } from '@chat/shared-types';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await getProjects(session.user.id, session.user.role as UserRole);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and team members can create projects
    if (session.user.role !== 'admin' && session.user.role !== 'team_member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.organizationId) {
      return NextResponse.json(
        { error: 'Name and organization are required' },
        { status: 400 }
      );
    }

    // Verify the organization exists and user has access
    const orgs = await getOrganizations(session.user.id, session.user.role as UserRole);
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

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}