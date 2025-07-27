import { config } from 'dotenv';
import path from 'path';

// Load env vars first
config({ path: path.join(process.cwd(), '.env.local') });

// Now import database-dependent modules
import { 
  createConversation,
  getConversation,
  updateConversation,
  getActiveConversations,
  getConversationMessages,
  createMessage,
  getOrCreateClientConversation
} from '../features/support-chat/lib/conversations';
import { db } from '../packages/database/src/client';
import { users } from '../packages/database/src/schema/auth';

async function testConversationDataLayer() {
  console.log('🧪 Testing Conversation Data Layer with real data...\n');

  try {
    // First, get some real users from the database
    console.log('📊 Fetching existing users...');
    const existingUsers = await db.select().from(users).limit(2);
    
    if (existingUsers.length < 2) {
      console.error('❌ Need at least 2 users in the database to test');
      return;
    }
    
    const clientUser = existingUsers.find(u => u.role === 'user') || existingUsers[0];
    const adminUser = existingUsers.find(u => u.role !== 'user') || existingUsers[1];
    
    console.log(`✅ Found client: ${clientUser.email} (${clientUser.role})`);
    console.log(`✅ Found admin: ${adminUser.email} (${adminUser.role})`);
    console.log('');

    // Test 1: Create conversation
    console.log('1️⃣ Testing createConversation...');
    const conversation = await createConversation(clientUser.id, adminUser.id);
    console.log('✅ Created conversation:', {
      id: conversation.id,
      clientId: conversation.clientId,
      assignedTo: conversation.assignedTo,
      status: conversation.status,
      priority: conversation.priority
    });
    console.log('');

    // Test 2: Get conversation
    console.log('2️⃣ Testing getConversation...');
    const fetched = await getConversation(conversation.id);
    console.log('✅ Fetched conversation:', fetched ? 'Found' : 'Not found');
    console.log('');

    // Test 3: Update conversation
    console.log('3️⃣ Testing updateConversation...');
    const updated = await updateConversation(conversation.id, {
      priority: 'high',
      status: 'active'
    });
    console.log('✅ Updated conversation priority to:', updated?.priority);
    console.log('');

    // Test 4: Create messages
    console.log('4️⃣ Testing createMessage...');
    const message1 = await createMessage(
      conversation.id,
      clientUser.id,
      'Hello, I need help with my project setup'
    );
    console.log('✅ Created client message');

    const message2 = await createMessage(
      conversation.id,
      adminUser.id,
      'Hi! I\'d be happy to help. What specific issue are you facing?'
    );
    console.log('✅ Created admin response');

    const internalNote = await createMessage(
      conversation.id,
      adminUser.id,
      'Customer seems to be having project setup issues - might need to check their environment',
      true
    );
    console.log('✅ Created internal note');
    console.log('');

    // Test 5: Get conversation messages
    console.log('5️⃣ Testing getConversationMessages...');
    const messages = await getConversationMessages(conversation.id);
    console.log(`✅ Retrieved ${messages.length} messages:`);
    messages.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.sender.email} (${msg.isInternalNote ? 'internal' : 'public'}): ${msg.content.substring(0, 50)}...`);
    });
    console.log('');

    // Test 6: Get active conversations
    console.log('6️⃣ Testing getActiveConversations...');
    const activeConvs = await getActiveConversations();
    console.log(`✅ Found ${activeConvs.length} active conversations`);
    activeConvs.slice(0, 3).forEach((conv, i) => {
      console.log(`   ${i + 1}. Client: ${conv.client.email}, Unread: ${conv.unreadCount}, Priority: ${conv.priority}`);
      if (conv.lastMessage) {
        console.log(`      Last message: "${conv.lastMessage.content.substring(0, 40)}..."`);
      }
    });
    console.log('');

    // Test 7: Get or create conversation
    console.log('7️⃣ Testing getOrCreateClientConversation...');
    const existingConv = await getOrCreateClientConversation(clientUser.id);
    console.log('✅ Got conversation for client:', existingConv.id === conversation.id ? 'Same as created' : 'Different conversation');
    console.log('');

    // Test 8: Clean up - mark as resolved
    console.log('8️⃣ Cleaning up test data...');
    await updateConversation(conversation.id, { status: 'resolved' });
    console.log('✅ Marked test conversation as resolved');
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testConversationDataLayer()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}