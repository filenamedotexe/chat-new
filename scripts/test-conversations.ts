import 'dotenv/config';
import { 
  createConversation,
  getConversation,
  updateConversation,
  getActiveConversations,
  getConversationMessages,
  createMessage,
  getOrCreateClientConversation
} from '../features/support-chat/lib/conversations';

async function testConversationDataLayer() {
  console.log('🧪 Testing Conversation Data Layer...\n');

  try {
    // Test 1: Create conversation
    console.log('1️⃣ Testing createConversation...');
    const conversation = await createConversation(
      '550e8400-e29b-41d4-a716-446655440000', // Sample client ID
      '550e8400-e29b-41d4-a716-446655440001'  // Sample admin ID
    );
    console.log('✅ Created conversation:', conversation);
    console.log('');

    // Test 2: Get conversation
    console.log('2️⃣ Testing getConversation...');
    const fetched = await getConversation(conversation.id);
    console.log('✅ Fetched conversation:', fetched);
    console.log('');

    // Test 3: Update conversation
    console.log('3️⃣ Testing updateConversation...');
    const updated = await updateConversation(conversation.id, {
      priority: 'high',
      status: 'active'
    });
    console.log('✅ Updated conversation:', updated);
    console.log('');

    // Test 4: Create messages
    console.log('4️⃣ Testing createMessage...');
    const message1 = await createMessage(
      conversation.id,
      '550e8400-e29b-41d4-a716-446655440000', // Client sends message
      'Hello, I need help with my project'
    );
    console.log('✅ Created client message:', message1);

    const message2 = await createMessage(
      conversation.id,
      '550e8400-e29b-41d4-a716-446655440001', // Admin responds
      'Hi! I\'d be happy to help. What specific issue are you facing?'
    );
    console.log('✅ Created admin message:', message2);

    const internalNote = await createMessage(
      conversation.id,
      '550e8400-e29b-41d4-a716-446655440001', // Admin internal note
      'Customer seems to be having project setup issues',
      true
    );
    console.log('✅ Created internal note:', internalNote);
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
    activeConvs.forEach((conv, i) => {
      console.log(`   ${i + 1}. Client: ${conv.client.email}, Unread: ${conv.unreadCount}, Priority: ${conv.priority}`);
      if (conv.lastMessage) {
        console.log(`      Last message: "${conv.lastMessage.content.substring(0, 40)}..."`);
      }
    });
    console.log('');

    // Test 7: Get or create conversation
    console.log('7️⃣ Testing getOrCreateClientConversation...');
    const existingConv = await getOrCreateClientConversation('550e8400-e29b-41d4-a716-446655440000');
    console.log('✅ Got existing conversation:', existingConv.id === conversation.id ? 'Same as created' : 'Different conversation');
    
    const newClientConv = await getOrCreateClientConversation('550e8400-e29b-41d4-a716-446655440002');
    console.log('✅ Created new conversation for new client:', newClientConv);
    console.log('');

    // Test 8: Test null scenarios
    console.log('8️⃣ Testing error scenarios...');
    const nonExistent = await getConversation('550e8400-e29b-41d4-a716-446655440999');
    console.log('✅ Non-existent conversation returns:', nonExistent);
    
    const updateNonExistent = await updateConversation('550e8400-e29b-41d4-a716-446655440999', { status: 'resolved' });
    console.log('✅ Update non-existent returns:', updateNonExistent);
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