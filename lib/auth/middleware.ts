import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getFeature } from '@/packages/database/src';

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isTestPage = pathname.startsWith('/test-');
  const isPublicPage = pathname === '/' || isAuthPage || isTestPage;
  const isApiRoute = pathname.startsWith('/api');
  
  // Let API routes handle their own authentication - don't redirect them
  if (isApiRoute) {
    return NextResponse.next();
  }
  
  try {
    // Check if Supabase auth is enabled
    const supabaseAuthFeature = await getFeature('supabaseAuth');
    const useSupabaseAuth = supabaseAuthFeature?.enabled || false;
    
    if (useSupabaseAuth) {
      // Use Supabase middleware (but only for pages, not API routes)
      return await updateSession(request);
    } else {
      // Use NextAuth middleware (existing logic)
      const sessionCookie = request.cookies.get('authjs.session-token') || 
                           request.cookies.get('__Secure-authjs.session-token');
      
      const isAuth = !!sessionCookie;
      
      // Redirect authenticated users away from auth pages
      if (isAuth && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Redirect unauthenticated users to login (pages only, not API routes)
      if (!isAuth && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      return NextResponse.next();
    }
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Fallback to NextAuth logic if feature flag check fails
    const sessionCookie = request.cookies.get('authjs.session-token') || 
                         request.cookies.get('__Secure-authjs.session-token');
    
    const isAuth = !!sessionCookie;
    
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (!isAuth && !isPublicPage && !isApiRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();
  }
}