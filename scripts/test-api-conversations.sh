#!/bin/bash

echo "🧪 Testing Conversation API Routes"
echo "================================="

# Base URL
BASE_URL="http://localhost:3000"

# Test 1: GET conversations without auth
echo -e "\n1️⃣ Testing GET /api/conversations (no auth):"
curl -s -X GET "$BASE_URL/api/conversations" \
  -H "Content-Type: application/json" | jq . || echo "Response: $(curl -s -X GET "$BASE_URL/api/conversations")"

# We need to get a session cookie first
echo -e "\n2️⃣ Getting session cookie by logging in:"
# First, let's check what users exist
echo "Available users:"
source .env.local 2>/dev/null
psql "${DATABASE_URL}" -c "SELECT id, email, role FROM users LIMIT 5;" 2>/dev/null | grep -v "command not found"

# Test with a real session (you'll need to login via browser and get the session cookie)
echo -e "\n3️⃣ To test with auth, you need to:"
echo "   a) Login via browser at http://localhost:3000/login"
echo "   b) Open DevTools > Application > Cookies"
echo "   c) Copy the 'authjs.session-token' cookie value"
echo "   d) Run the following commands with your cookie:"
echo ""
echo "# For admin/team_member user:"
echo "curl -s -X GET \"$BASE_URL/api/conversations\" \\"
echo "  -H \"Cookie: authjs.session-token=YOUR_SESSION_TOKEN\" | jq ."
echo ""
echo "# For client user:"
echo "curl -s -X GET \"$BASE_URL/api/conversations\" \\"
echo "  -H \"Cookie: authjs.session-token=YOUR_SESSION_TOKEN\" | jq ."
echo ""
echo "# POST to create conversation (client only):"
echo "curl -s -X POST \"$BASE_URL/api/conversations\" \\"
echo "  -H \"Cookie: authjs.session-token=YOUR_SESSION_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" | jq ."