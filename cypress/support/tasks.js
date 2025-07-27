// cypress/support/tasks.js
require('dotenv').config({ path: '.env.local' });
const { db } = require('../../packages/database/src/client');
const { conversations } = require('../../packages/database/src/schema/conversations');
const { messages } = require('../../packages/database/src/schema/communications');
const { users } = require('../../packages/database/src/schema/auth');
const { eq } = require('drizzle-orm');
const { ensureValidUUID, createTestUser } = require('./uuid-utils');

module.exports = {
  async cleanupTestData() {
    try {
      // Clean up test data in correct order (respecting foreign keys)
      await db.delete(messages).where(eq(messages.content, 'TEST_MESSAGE'));
      await db.delete(conversations); // Clean all test conversations
      await db.delete(users).where(eq(users.email, 'test@example.com'));
      return 'Test data cleanup completed';
    } catch (error) {
      console.error('Cleanup failed:', error);
      return 'Cleanup failed';
    }
  },
  
  async seedTestData(data) {
    try {
      if (data?.users) {
        for (const user of data.users) {
          await db.insert(users).values({
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role || 'client',
            passwordHash: user.passwordHash || '$2a$10$test-hash'
          }).onConflictDoNothing();
        }
      }
      return 'Test data seeded';
    } catch (error) {
      console.error('Seeding failed:', error);
      return 'Seeding failed';
    }
  },

  async 'db:reset'() {
    try {
      // Delete all test conversations and messages (if they exist)
      await db.delete(messages);
      await db.delete(conversations);
      // Keep users for auth, just clean up conversations
      return 'Database reset completed';
    } catch (error) {
      console.error('Database reset failed:', error);
      return 'Database reset failed';
    }
  },

  async 'db:seed'(data) {
    try {
      if (data?.users) {
        for (const user of data.users) {
          const userId = ensureValidUUID(user.id);
          
          // Check if user already exists
          const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
          
          if (existingUser.length === 0) {
            const validUser = createTestUser(
              user.email,
              user.role || 'client',
              userId
            );
            
            try {
              await db.insert(users).values(validUser);
            } catch (insertError) {
              // If email conflict, try with timestamp suffix
              const fallbackUser = createTestUser(
                `${Date.now()}-${user.email}`,
                user.role || 'client',
                userId
              );
              await db.insert(users).values(fallbackUser);
            }
          }
        }
      }
      return 'Database seeded';
    } catch (error) {
      console.error('Database seeding failed:', error);
      return 'Database seeding failed';
    }
  },

  async 'db:createConversation'(data) {
    try {
      const clientId = ensureValidUUID(data.clientId);
      
      // First check if user exists
      const existingUser = await db.select().from(users).where(eq(users.id, clientId)).limit(1);
      
      if (existingUser.length === 0) {
        // User doesn't exist, create them
        const testUser = createTestUser(
          `test-user-${clientId.slice(0, 8)}@example.com`,
          'client',
          clientId
        );
        
        try {
          await db.insert(users).values(testUser);
        } catch (insertError) {
          // If insert fails due to email conflict, try with a different email
          const fallbackUser = createTestUser(
            `test-user-${Date.now()}-${clientId.slice(0, 8)}@example.com`,
            'client',
            clientId
          );
          await db.insert(users).values(fallbackUser);
        }
      }
      
      const result = await db.insert(conversations).values({
        clientId: clientId,
        status: 'active',
        priority: 'normal'
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Create conversation failed:', error);
      throw error;
    }
  },

  async 'db:createConversationWithMessages'(data) {
    try {
      const clientId = ensureValidUUID(data.clientId);
      const adminId = ensureValidUUID(); // Generate new admin UUID
      
      // Check and create client user if needed
      const existingClient = await db.select().from(users).where(eq(users.id, clientId)).limit(1);
      if (existingClient.length === 0) {
        const clientUser = createTestUser(
          `test-client-${Date.now()}-${clientId.slice(0, 8)}@example.com`,
          'client',
          clientId
        );
        await db.insert(users).values(clientUser);
      }
      
      // Check and create admin user if needed
      const existingAdmin = await db.select().from(users).where(eq(users.id, adminId)).limit(1);
      if (existingAdmin.length === 0) {
        const adminUser = createTestUser(
          `test-admin-${Date.now()}-${adminId.slice(0, 8)}@example.com`,
          'admin',
          adminId
        );
        await db.insert(users).values(adminUser);
      }
      
      // Create conversation
      const conversationResult = await db.insert(conversations).values({
        clientId: clientId,
        status: 'active',
        priority: 'normal'
      }).returning();
      const conversation = conversationResult[0];

      // Create messages
      for (let i = 0; i < data.messageCount; i++) {
        const isInternal = data.includeInternalNotes && i % 3 === 0;
        await db.insert(messages).values({
          conversationId: conversation.id,
          senderId: isInternal ? adminId : clientId,
          content: `Message ${i + 1}`,
          isInternalNote: isInternal
        });
      }
      
      return conversation;
    } catch (error) {
      console.error('Create conversation with messages failed:', error);
      throw error;
    }
  }
};