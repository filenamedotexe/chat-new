import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware-debug';

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const isApiRoute = pathname.startsWith('/api');
  
  // Let API routes handle their own authentication - don't redirect them
  if (isApiRoute) {
    return NextResponse.next();
  }
  
  // Always use Supabase middleware for page routes
  return await updateSession(request);
}