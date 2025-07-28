import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateUserRoles() {
  console.log('🔧 Updating user roles...');
  
  const users = [
    { email: 'admin@test.com', role: 'admin' },
    { email: 'team@test.com', role: 'team_member' },
    { email: 'client@test.com', role: 'client' }
  ];
  
  for (const userData of users) {
    try {
      // Get user by email
      const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
      
      if (fetchError) {
        console.error(`Error fetching users:`, fetchError);
        continue;
      }
      
      const user = users.users.find(u => u.email === userData.email);
      
      if (!user) {
        console.log(`❌ User ${userData.email} not found`);
        continue;
      }
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            role: userData.role,
            name: userData.email.split('@')[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
          }
        }
      );
      
      if (updateError) {
        console.error(`❌ Error updating ${userData.email}:`, updateError);
      } else {
        console.log(`✅ Updated ${userData.email} with role: ${userData.role}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${userData.email}:`, error);
    }
  }
  
  console.log('✨ User role update complete!');
}

updateUserRoles().catch(console.error);