import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { hashPassword } from '@/lib/auth/password';
import { db } from '@chat/database';
import { users } from '@chat/database';
import { eq } from 'drizzle-orm';

async function createTestUsers() {
  console.log('Creating test users...');

  const testUsers = [
    {
      email: 'admin@agency.com',
      password: 'admin123456',
      name: 'Admin User',
      role: 'admin' as const,
    },
    {
      email: 'client@example.com',
      password: 'client123456',
      name: 'Client User',
      role: 'client' as const,
    },
    {
      email: 'team@agency.com',
      password: 'team123456',
      name: 'Team Member',
      role: 'team_member' as const,
    },
  ];

  for (const testUser of testUsers) {
    try {
      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, testUser.email));

      if (existingUser) {
        console.log(`User ${testUser.email} already exists`);
        continue;
      }

      // Hash password
      const passwordHash = await hashPassword(testUser.password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: testUser.email,
          name: testUser.name,
          passwordHash,
          role: testUser.role,
        })
        .returning();

      console.log(`Created user: ${newUser.email} with role: ${newUser.role}`);
    } catch (error) {
      console.error(`Failed to create user ${testUser.email}:`, error);
    }
  }

  console.log('\nTest users created successfully!');
  console.log('\nCredentials:');
  console.log('------------');
  console.log('Admin: admin@agency.com / admin123456');
  console.log('Client: client@example.com / client123456');
  console.log('Team Member: team@agency.com / team123456');
}

// Run the script
createTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create test users:', error);
    process.exit(1);
  });