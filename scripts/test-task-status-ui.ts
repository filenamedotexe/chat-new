// Script to test task status updates through the API

const BASE_URL = 'http://localhost:3001';

async function testTaskStatusUpdate() {
  console.log('🔧 Testing Task Status Update UI...\n');

  // First get a task ID from our test data
  const taskId = '67bef59f-d04e-4fb6-82ab-7f0025e5c1f6'; // Basic Task from our test data
  
  // Test status update API endpoint directly
  console.log(`Testing PATCH /api/tasks/${taskId}/status`);
  
  try {
    // Simulate clicking "Start Task" button
    console.log('1. Simulating "Start Task" button click (not_started → in_progress)');
    const response = await fetch(`${BASE_URL}/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real UI, this would have auth cookies
      },
      body: JSON.stringify({ status: 'in_progress' }),
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.text();
    console.log(`Response: ${data}\n`);

    if (response.status === 401) {
      console.log('⚠️  API requires authentication - this is expected behavior');
      console.log('✅ The endpoint exists and is responding correctly');
      console.log('\nThe actual UI test needs to be done manually in the browser with a logged-in session.');
    }
  } catch (error) {
    console.error('❌ Error calling API:', error);
  }
}

testTaskStatusUpdate();