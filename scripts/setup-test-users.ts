import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from '@chat/database';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupTestUsers() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  // Check existing users
  console.log('Checking existing users...');
  const existingUsers = await db.select().from(users);
  console.log('Current users:', existingUsers.map(u => ({ email: u.email, role: u.role })));
  
  // Create team member if doesn't exist
  const teamUser = existingUsers.find(u => u.email === 'team@example.com');
  if (!teamUser) {
    console.log('Creating team member test user...');
    const hashedPassword = await bcrypt.hash('team123', 10);
    await db.insert(users).values({
      id: uuidv4(),
      email: 'team@example.com',
      name: 'Test Team Member',
      passwordHash: hashedPassword,
      role: 'team_member',
    });
    console.log('Team member created successfully!');
  } else {
    console.log('Team member already exists');
  }
  
  // Verify all test users
  const allUsers = await db.select().from(users);
  console.log('\nFinal user list:');
  allUsers.forEach(u => {
    console.log(`- ${u.email} (${u.role})`);
  });
  
  process.exit(0);
}

setupTestUsers().catch(console.error);