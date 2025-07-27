// UUID utility functions for consistent test data
const { randomUUID } = require('crypto');

// Pre-generated test UUIDs for consistent testing
const TEST_UUIDS = {
  // Admin users
  ADMIN_1: '550e8400-e29b-41d4-a716-446655440001',
  ADMIN_2: '550e8400-e29b-41d4-a716-446655440002',
  
  // Client users  
  CLIENT_1: '550e8400-e29b-41d4-a716-446655440011',
  CLIENT_2: '550e8400-e29b-41d4-a716-446655440012',
  CLIENT_3: '550e8400-e29b-41d4-a716-446655440013',
  
  // Team users
  TEAM_1: '550e8400-e29b-41d4-a716-446655440021',
  TEAM_2: '550e8400-e29b-41d4-a716-446655440022',
  
  // Test conversations
  CONVERSATION_1: '550e8400-e29b-41d4-a716-446655440031',
  CONVERSATION_2: '550e8400-e29b-41d4-a716-446655440032',
  CONVERSATION_3: '550e8400-e29b-41d4-a716-446655440033',
  
  // Test messages
  MESSAGE_1: '550e8400-e29b-41d4-a716-446655440041',
  MESSAGE_2: '550e8400-e29b-41d4-a716-446655440042',
  MESSAGE_3: '550e8400-e29b-41d4-a716-446655440043',
};

// Generate new UUID if needed
function generateUUID() {
  return randomUUID();
}

// Validate UUID format
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Ensure string is valid UUID, generate one if not
function ensureValidUUID(input) {
  if (!input) return generateUUID();
  if (isValidUUID(input)) return input;
  return generateUUID();
}

// Create test user data with proper UUIDs
function createTestUser(email, role = 'client', customId = null) {
  const id = customId || generateUUID();
  // Ensure unique email by including UUID fragment
  const uniqueEmail = email || `test-${id.slice(0, 8)}@example.com`;
  
  return {
    id: id,
    email: uniqueEmail,
    name: uniqueEmail.split('@')[0],
    role: role,
    passwordHash: '$2a$10$test-hash-for-password123'
  };
}

module.exports = {
  TEST_UUIDS,
  generateUUID,
  isValidUUID,
  ensureValidUUID,
  createTestUser
};