import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { db } from '@chat/database';
import { users } from '@chat/database';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and team members can see all users
    // Clients can only see themselves
    let userList;
    
    if (session.user.role === 'admin' || session.user.role === 'team_member') {
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
        .where(eq(users.id, session.user.id));
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