#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createTestUser() {
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const email = 'test@example.com';
    const name = 'Test User';
    const role = 'client';
    const passwordHash = '$2a$10$test-hash-for-password123';
    
    console.log('Creating test user...');
    
    // First check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE id = ${userId} OR email = ${email}
    `;
    
    if (existing.length > 0) {
      console.log('Test user already exists:', existing[0]);
      return existing[0];
    }
    
    // Create the user
    const result = await sql`
      INSERT INTO users (id, email, name, role, password_hash)
      VALUES (${userId}, ${email}, ${name}, ${role}, ${passwordHash})
      RETURNING id, email, name, role, created_at
    `;
    
    console.log('Test user created successfully:', result[0]);
    return result[0];
    
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser };