import { config } from 'dotenv';
import path from 'path';

// Load env vars
config({ path: path.join(process.cwd(), '.env.local') });

const API_URL = 'http://localhost:3000/api';

async function getAuthCookie() {
  // First, let's check what cookies are needed by looking at a working endpoint
  const response = await fetch(`${API_URL}/users`, {
    credentials: 'include',
    headers: {
      'Cookie': 'next-auth.session-token=test' // This will fail but show us what's needed
    }
  });
  
  console.log('Auth test response:', response.status, response.statusText);
  return '';
}

async function testConversationAPI() {
  console.log('🧪 Testing Conversation API Routes...\n');
  
  try {
    // Test 1: GET /api/conversations without auth
    console.log('1️⃣ Testing GET /api/conversations (no auth)...');
    let response = await fetch(`${API_URL}/conversations`);
    console.log(`Response: ${response.status} ${response.statusText}`);
    if (response.status === 401) {
      console.log('✅ Correctly returns 401 Unauthorized\n');
    } else {
      console.log('❌ Should return 401 without auth\n');
    }

    // Test 2: POST /api/conversations without auth  
    console.log('2️⃣ Testing POST /api/conversations (no auth)...');
    response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`Response: ${response.status} ${response.statusText}`);
    if (response.status === 401) {
      console.log('✅ Correctly returns 401 Unauthorized\n');
    } else {
      console.log('❌ Should return 401 without auth\n');
    }

    // For authenticated tests, we'd need to:
    // 1. Create a test user session
    // 2. Get the session cookie
    // 3. Include it in requests
    
    console.log('📝 Note: To fully test authenticated endpoints, run the app and use browser DevTools');
    console.log('   or create a proper test suite with authenticated sessions.\n');
    
    // Test the structure is correct
    console.log('3️⃣ Checking route files exist...');
    const routeFile = path.join(process.cwd(), 'app/api/conversations/route.ts');
    const fs = require('fs');
    
    if (fs.existsSync(routeFile)) {
      console.log('✅ /app/api/conversations/route.ts exists');
      
      // Check exports
      const content = fs.readFileSync(routeFile, 'utf-8');
      const hasGET = content.includes('export async function GET');
      const hasPOST = content.includes('export async function POST');
      const hasAuth = content.includes('await auth()');
      const hasRoleCheck = content.includes('userRole === ');
      
      console.log(`✅ GET handler: ${hasGET ? 'Present' : 'Missing'}`);
      console.log(`✅ POST handler: ${hasPOST ? 'Present' : 'Missing'}`);
      console.log(`✅ Auth check: ${hasAuth ? 'Present' : 'Missing'}`);
      console.log(`✅ Role-based access: ${hasRoleCheck ? 'Present' : 'Missing'}`);
    } else {
      console.log('❌ Route file missing!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testConversationAPI();
}