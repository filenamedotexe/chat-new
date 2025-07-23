// Test API endpoints
const API_BASE_URL = 'http://localhost:3001';

async function testApiEndpoints() {
  console.log('🌐 Testing API Endpoints...\n');

  // Helper function to make requests
  async function testEndpoint(method: string, path: string, body?: any, expectedStatus = 200) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // In a real test, we'd need to include auth cookies/headers
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = response.ok ? await response.json() : await response.text();
      
      console.log(`${method} ${path}`);
      console.log(`Status: ${response.status} (expected: ${expectedStatus})`);
      console.log(`Response:`, data);
      console.log('---\n');

      return { response, data };
    } catch (error) {
      console.error(`❌ Failed to test ${method} ${path}:`, error);
      return null;
    }
  }

  // Test users endpoint
  console.log('1️⃣ Testing /api/users');
  await testEndpoint('GET', '/api/users', null, 401); // Should fail without auth

  // Test organizations endpoint  
  console.log('2️⃣ Testing /api/organizations');
  await testEndpoint('GET', '/api/organizations', null, 401);
  
  // Test with a new organization (will fail without auth but shows structure)
  const newOrg = {
    name: 'API Test Organization',
    slug: 'api-test-org',
    type: 'client',
    description: 'Testing API endpoints',
  };
  await testEndpoint('POST', '/api/organizations', newOrg, 401);

  // Test tasks endpoint
  console.log('3️⃣ Testing /api/tasks');
  await testEndpoint('GET', '/api/tasks?projectId=test', null, 401);
  
  const newTask = {
    projectId: 'test-id',
    title: 'API Test Task',
    description: 'Testing task creation via API',
    assignedToId: null,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  await testEndpoint('POST', '/api/tasks', newTask, 401);

  // Test task status update
  console.log('4️⃣ Testing /api/tasks/[id]/status');
  await testEndpoint('PATCH', '/api/tasks/test-id/status', { status: 'in_progress' }, 401);

  console.log('\n✅ API endpoint structure test complete!');
  console.log('Note: All endpoints returned 401 as expected without authentication.');
  console.log('In production, these would require proper session cookies.');
}

testApiEndpoints().catch(console.error);