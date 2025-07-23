import { NextResponse } from 'next/server';
import { db } from '@chat/database';
import { users } from '@chat/database';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

export async function GET() {
  try {
    // Check if database connection works
    const allUsers = await db.select().from(users);
    
    // Test password hashing
    const testPassword = 'admin123456';
    const hashedPassword = await hashPassword(testPassword);
    const verifyResult = await verifyPassword(testPassword, hashedPassword);
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount: allUsers.length,
        users: allUsers.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          hasPassword: !!u.passwordHash
        }))
      },
      passwordTest: {
        hashed: hashedPassword,
        verified: verifyResult
      },
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasAuthUrl: !!process.env.NEXTAUTH_URL,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    // Create test user
    const hashedPassword = await hashPassword(password);
    
    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUsers.length > 0) {
      // Update password
      await db.update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.email, email));
      
      return NextResponse.json({
        message: 'User password updated',
        email
      });
    } else {
      // Create new user
      const [newUser] = await db.insert(users)
        .values({
          email,
          name: email.split('@')[0],
          passwordHash: hashedPassword,
          role: email.includes('admin') ? 'admin' : 'client'
        })
        .returning();
      
      return NextResponse.json({
        message: 'User created',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role
        }
      });
    }
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Add missing import
import { eq } from 'drizzle-orm';