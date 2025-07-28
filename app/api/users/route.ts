import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-auth';
import { db } from '@chat/database';
import { users } from '@chat/database';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    
    if (error) {
      return error;
    }

    // Only admins and team members can see all users
    // Clients can only see themselves
    let userList;
    
    if (user.role === 'admin' || user.role === 'team_member') {
      // Get all users
      userList = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .orderBy(users.name);
    } else {
      // Clients only see themselves
      userList = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, user.id));
    }

    return NextResponse.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}