const { sql, createFeature, updateFeature, createUser, getFeature } = require('./packages/database/src/index.ts');

async function setupAuthentication() {
  console.log('🔧 Setting up authentication system...\n');
  
  try {
    // 1. Enable Supabase Auth feature flag
    console.log('1. Enabling Supabase Auth feature flag...');
    let supabaseAuthFeature = await getFeature('supabaseAuth');
    
    if (!supabaseAuthFeature) {
      supabaseAuthFeature = await createFeature({
        name: 'supabaseAuth',
        description: 'Enable Supabase authentication instead of NextAuth',
        enabled: true
      });
      console.log('   ✅ Created and enabled supabaseAuth feature');
    } else if (!supabaseAuthFeature.enabled) {
      await updateFeature('supabaseAuth', { enabled: true });
      console.log('   ✅ Enabled existing supabaseAuth feature');
    } else {
      console.log('   ✅ supabaseAuth feature already enabled');
    }
    
    // 2. Create test users
    console.log('\n2. Creating test users...');
    
    // Note: Since we're using Supabase auth, we need to create users in Supabase
    // For now, let's just log the credentials that need to be created
    console.log('   📝 Test users to create in Supabase:');
    console.log('   Admin: admin@test.com / password123 (role: admin)');
    console.log('   Team Member: team@test.com / password123 (role: team_member)');
    console.log('   Client: client@test.com / password123 (role: client)');
    
    console.log('\n3. Checking database connection...');
    const result = await sql`SELECT 1 as test`;
    console.log('   ✅ Database connection successful');
    
    console.log('\n🎉 Authentication setup complete!');
    console.log('\nNext steps:');
    console.log('1. Create the test users in Supabase Auth dashboard');
    console.log('2. Update user roles in the database after creation');
    console.log('3. Test login with the test accounts');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAuthentication();