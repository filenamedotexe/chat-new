// Debug version to find the issue
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  console.log(`[MIDDLEWARE] Processing: ${request.nextUrl.pathname}`);
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = request.cookies.get(name)?.value;
          console.log(`[MIDDLEWARE] Cookie get: ${name} = ${value ? 'exists' : 'missing'}`);
          return value;
        },
        set(name: string, value: string, options: any) {
          console.log(`[MIDDLEWARE] Cookie set: ${name}`);
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          console.log(`[MIDDLEWARE] Cookie remove: ${name}`);
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  console.log(`[MIDDLEWARE] User: ${user ? user.email : 'none'}, Error: ${error?.message || 'none'}`);

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isPublicRoute = pathname === '/' || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon');

  console.log(`[MIDDLEWARE] Path: ${pathname}, IsAuth: ${isAuthPage}, IsPublic: ${isPublicRoute}, HasUser: ${!!user}`);

  // Not logged in, trying to access protected route
  if (!user && !isAuthPage && !isPublicRoute) {
    console.log(`[MIDDLEWARE] Redirecting to login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in, trying to access auth pages
  if (user && isAuthPage) {
    console.log(`[MIDDLEWARE] Redirecting to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log(`[MIDDLEWARE] Allowing through`);
  return response;
}