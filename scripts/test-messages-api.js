#!/usr/bin/env node

/**
 * Test script for the messages API
 * This script tests the messages API endpoints with proper authentication
 */

async function testMessagesAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Messages API...\n');
  
  try {
    // Step 1: Login to get session
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@example.com',
        password: 'admin123',
        csrfToken: '', // NextAuth will handle this
      }),
      redirect: 'manual',
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    if (!cookies) {
      throw new Error('No session cookie received');
    }
    
    console.log('✓ Login successful\n');
    
    // Step 2: Test GET messages (should return empty array)
    console.log('2. Testing GET /api/messages with projectId...');
    const getResponse = await fetch(`${baseUrl}/api/messages?projectId=123e4567-e89b-12d3-a456-426614174000`, {
      headers: {
        'Cookie': cookies,
      },
    });
    
    if (!getResponse.ok) {
      const error = await getResponse.text();
      throw new Error(`GET failed: ${getResponse.status} - ${error}`);
    }
    
    const getResult = await getResponse.json();
    console.log('✓ GET response:', JSON.stringify(getResult, null, 2));
    console.log('\n');
    
    // Step 3: Test POST message
    console.log('3. Testing POST /api/messages...');
    const postResponse = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify({
        content: 'Test message from API test script',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'text',
      }),
    });
    
    if (!postResponse.ok) {
      const error = await postResponse.text();
      throw new Error(`POST failed: ${postResponse.status} - ${error}`);
    }
    
    const postResult = await postResponse.json();
    console.log('✓ POST response:', JSON.stringify(postResult, null, 2));
    console.log('\n');
    
    // Step 4: Test GET again to see the new message
    console.log('4. Testing GET /api/messages again to see the new message...');
    const getResponse2 = await fetch(`${baseUrl}/api/messages?projectId=123e4567-e89b-12d3-a456-426614174000`, {
      headers: {
        'Cookie': cookies,
      },
    });
    
    const getResult2 = await getResponse2.json();
    console.log('✓ GET response with messages:', JSON.stringify(getResult2, null, 2));
    console.log('\n');
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testMessagesAPI();