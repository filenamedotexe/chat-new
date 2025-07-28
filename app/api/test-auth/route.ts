import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing auth components...');
    
    // Test 1: Environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        details: {
          url: !!supabaseUrl,
          key: !!supabaseKey
        }
      }, { status: 500 });
    }
    
    // Test 2: Import Supabase client
    console.log('Testing Supabase client import...');
    const { createClient } = await import('@/lib/supabase/client');
    console.log('✅ Supabase client imported successfully');
    
    // Test 3: Create client instance
    console.log('Testing client creation...');
    const supabase = createClient();
    console.log('✅ Supabase client created successfully');
    
    // Test 4: Test connection
    console.log('Testing Supabase connection...');
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('Session error (expected for no user):', error.message);
    }
    
    console.log('✅ Supabase connection test complete');
    
    return NextResponse.json({
      success: true,
      tests: {
        envVars: true,
        clientImport: true,
        clientCreation: true,
        connection: true
      },
      sessionError: error?.message || null
    });
    
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return NextResponse.json({
      error: 'Auth test failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}