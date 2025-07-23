import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPublicPage = pathname === '/' || isAuthPage;
  const isApiRoute = pathname.startsWith('/api');
  
  // For now, we'll use a simple cookie check
  // In production, you'd validate the JWT token here
  const sessionCookie = request.cookies.get('authjs.session-token') || 
                       request.cookies.get('__Secure-authjs.session-token');
  
  const isAuth = !!sessionCookie;
  
  // Redirect authenticated users away from auth pages
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users to login
  if (!isAuth && !isPublicPage && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}