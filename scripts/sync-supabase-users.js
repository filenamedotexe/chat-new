// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const { neon } = require('@neondatabase/serverless');

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = neon(databaseUrl);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function syncSupabaseUsers() {
  console.log('🔄 Syncing Supabase Auth users with database...\n');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  // Create admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing Supabase users:', authError);
      return;
    }

    console.log(`Found ${authUsers.users.length} users in Supabase Auth\n`);

    for (const authUser of authUsers.users) {
      console.log(`👤 Processing user: ${authUser.email}`);
      
      // Check if user exists in our database (by email, not ID)
      const existingUser = await sql`
        SELECT id, email, role FROM users 
        WHERE email = ${authUser.email}
      `;

      if (existingUser.length > 0) {
        console.log(`   ✅ User already exists in database with role: ${existingUser[0].role}`);
        
        // Update the user ID in database to match Supabase Auth ID
        if (existingUser[0].id !== authUser.id) {
          console.log(`   🔄 Updating user ID from ${existingUser[0].id} to ${authUser.id}`);
          await sql`
            UPDATE users 
            SET id = ${authUser.id}, updated_at = NOW()
            WHERE email = ${authUser.email}
          `;
        }
        
        // Update user metadata in Supabase to match database role
        if (existingUser[0].role) {
          await supabase.auth.admin.updateUserById(authUser.id, {
            user_metadata: {
              ...authUser.user_metadata,
              role: existingUser[0].role
            }
          });
          console.log(`   🔄 Updated Supabase metadata with role: ${existingUser[0].role}`);
        }
      } else {
        // Create user in database
        const role = authUser.user_metadata?.role || 'client';
        const name = authUser.user_metadata?.name || authUser.email?.split('@')[0];
        
        console.log(`   ➕ Creating user in database with role: ${role}`);
        
        // For Supabase Auth, we use a dummy password hash since auth is handled by Supabase
        const dummyPasswordHash = '$2a$10$dummy.hash.for.supabase.auth.integration';
        
        await sql`
          INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
          VALUES (
            ${authUser.id},
            ${authUser.email},
            ${name},
            ${dummyPasswordHash},
            ${role},
            ${authUser.created_at},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET 
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            updated_at = NOW()
        `;
        
        console.log(`   ✅ Created user in database`);
      }
    }

    console.log('\n🎉 User sync complete!\n');

    // Show current users
    const allUsers = await sql`
      SELECT id, email, name, role 
      FROM users 
      ORDER BY created_at DESC
    `;

    console.log('📋 Current users in database:');
    allUsers.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.email} (${user.name})`);
    });

  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

syncSupabaseUsers().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});