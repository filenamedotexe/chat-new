import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { getProjectsWithStats } from '@/features/projects/data/projects';
import type { UserRole } from '@chat/shared-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    
    if (error) {
      return error;
    }

    const projects = await getProjectsWithStats(user.id, user.role as UserRole);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects with stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}