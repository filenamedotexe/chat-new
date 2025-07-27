// Test-specific authentication for Cypress tests
import { NextRequest } from 'next/server';

export interface TestSession {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export function getTestSession(request: NextRequest): TestSession | null {
  // Only allow test auth in development and test environments
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Check for test session header
  const testSessionHeader = request.headers.get('x-test-user');
  if (testSessionHeader) {
    try {
      const userData = JSON.parse(testSessionHeader);
      if (userData.id && userData.email && userData.role) {
        return {
          user: {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            name: userData.name || userData.email.split('@')[0]
          }
        };
      }
    } catch (error) {
      console.warn('Failed to parse test session header:', error);
    }
  }

  // Check for mock session header (legacy)
  const mockSessionHeader = request.headers.get('x-mock-session');
  if (mockSessionHeader) {
    try {
      const sessionData = JSON.parse(mockSessionHeader);
      if (sessionData.user?.id && sessionData.user?.email && sessionData.user?.role) {
        return sessionData as TestSession;
      }
    } catch (error) {
      console.warn('Failed to parse mock session header:', error);
    }
  }

  return null;
}