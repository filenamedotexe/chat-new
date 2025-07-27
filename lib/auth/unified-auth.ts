// Unified authentication that supports both NextAuth and test sessions
import { NextRequest } from 'next/server';
import { auth } from './auth.config';
import { getTestSession } from './test-auth';

export type UnifiedSession = {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
} | null;

export async function getUnifiedAuth(request?: NextRequest): Promise<UnifiedSession> {
  // In test/development environment, check for test session first
  if (request && process.env.NODE_ENV !== 'production') {
    const testSession = getTestSession(request);
    if (testSession) {
      return testSession;
    }
  }

  // Fall back to NextAuth
  const session = await auth();
  if (!session) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email || '',
      role: session.user.role,
      name: session.user.name || undefined
    }
  };
}