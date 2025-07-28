import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Log what cookies we have
  const cookieInfo = allCookies.map(c => ({
    name: c.name,
    valueLength: c.value.length,
    hasSupabase: c.name.includes('sb-')
  }));
  
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    return NextResponse.json({
      cookies: cookieInfo,
      session: {
        exists: !!session,
        error: sessionError?.message,
        userId: session?.user?.id,
        email: session?.user?.email
      },
      user: {
        exists: !!user,
        error: userError?.message,
        id: user?.id,
        email: user?.email
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      cookies: cookieInfo
    });
  }
}