const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function verifyUsers() {
  console.log('🔍 Verifying users in Supabase Auth...\n');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  console.log('🔧 Supabase URL:', supabaseUrl);
  console.log('🔑 Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
  console.log('');

  // Create admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('📋 Listing all users in Supabase Auth...');
    
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error listing users:', error.message);
      return;
    }

    if (!data || !data.users || data.users.length === 0) {
      console.log('❌ NO USERS FOUND in Supabase Auth!');
      console.log('');
      console.log('🚨 This explains why login is failing!');
      console.log('');
      console.log('🔧 Let me recreate the users...');
      
      await createUsersAgain(supabase);
      return;
    }

    console.log(`✅ Found ${data.users.length} users in Supabase Auth:`);
    console.log('');

    data.users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   Metadata:`, user.user_metadata);
      console.log('');
    });

    // Test login with the first user
    const testUser = data.users.find(u => u.email === 'admin@test.com');
    if (testUser) {
      console.log('🧪 Testing login with admin@test.com...');
      
      // Test with regular client (not admin)
      const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const { data: signInData, error: signInError } = await testClient.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'password123'
      });

      if (signInError) {
        console.log(`❌ Login test failed: ${signInError.message}`);
      } else {
        console.log(`✅ Login test successful for ${signInData.user?.email}`);
        
        // Sign out
        await testClient.auth.signOut();
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function createUsersAgain(supabase) {
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

  console.log('🔄 Creating users again...\n');

  for (const user of testUsers) {
    try {
      console.log(`👤 Creating: ${user.email}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      });

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created: ${data.user?.id}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 User creation completed!');
  console.log('\n📝 Test these credentials at http://localhost:3000/login:');
  testUsers.forEach(user => {
    console.log(`   ${user.email} / ${user.password} (${user.role})`);
  });
}

verifyUsers().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});