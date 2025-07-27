import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { getProjectsWithStats } from '@/features/projects/data/projects';
import type { UserRole } from '@chat/shared-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await getProjectsWithStats(session.user.id, session.user.role as UserRole);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects with stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}