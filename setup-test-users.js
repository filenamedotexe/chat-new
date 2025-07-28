const { createClient } = require('@supabase/supabase-js');

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setupTestUsers() {
  console.log('🔧 Setting up test users in Supabase Auth...\n');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('SERVICE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
    return;
  }

  // Create admin client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const testUsers = [
    {
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      name: 'Test Admin'
    },
    {
      email: 'team@test.com', 
      password: 'password123',
      role: 'team_member',
      name: 'Test Team Member'
    },
    {
      email: 'client@test.com',
      password: 'password123', 
      role: 'client',
      name: 'Test Client'
    }
  ];

  console.log('Creating test users...\n');

  for (const user of testUsers) {
    try {
      console.log(`👤 Creating user: ${user.email} (${user.role})`);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          name: user.name,
          role: user.role
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  User ${user.email} already exists`);
          
          // Try to get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(u => u.email === user.email);
          
          if (existingUser) {
            console.log(`   ✅ Found existing user: ${existingUser.id}`);
            
            // Update user metadata if needed
            await supabase.auth.admin.updateUserById(existingUser.id, {
              user_metadata: {
                name: user.name,
                role: user.role
              }
            });
            console.log(`   🔄 Updated user metadata for ${user.email}`);
          }
        } else {
          console.log(`   ❌ Failed to create ${user.email}:`, authError.message);
        }
        continue;
      }

      if (authData.user) {
        console.log(`   ✅ Created user successfully: ${authData.user.id}`);
        console.log(`   📧 Email: ${authData.user.email}`);
        console.log(`   👤 Name: ${authData.user.user_metadata?.name}`);
        console.log(`   🔐 Role: ${authData.user.user_metadata?.role}`);
      }

    } catch (error) {
      console.log(`   ❌ Unexpected error creating ${user.email}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎉 Test user setup complete!\n');
  console.log('📋 Test Credentials:');
  testUsers.forEach(user => {
    console.log(`   ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
  
  console.log('\n🚀 Ready to test authentication!');
  console.log('1. Go to http://localhost:3000/login');
  console.log('2. Try logging in with any of the test credentials above');
  console.log('3. Verify role-based access and file operations');
}

setupTestUsers().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});