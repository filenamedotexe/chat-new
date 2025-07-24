const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testFileAPI() {
  console.log('=== Testing File Upload API ===\n');
  
  // First, we need to get an auth token by logging in
  const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: 'admin@example.com',
      password: 'admin123',
      csrfToken: '', // NextAuth might require this
    }),
    redirect: 'manual',
  });
  
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('Login response status:', loginResponse.status);
  
  if (!cookies) {
    console.log('❌ Failed to get auth cookies');
    return;
  }
  
  // Create a test file
  const testFileName = 'test-upload.txt';
  const testFileContent = 'This is a test file for upload testing.';
  const testFilePath = path.join(process.cwd(), testFileName);
  
  fs.writeFileSync(testFilePath, testFileContent);
  console.log('✅ Created test file:', testFileName);
  
  try {
    // Create form data
    const form = new FormData();
    form.append('files', fs.createReadStream(testFilePath), {
      filename: testFileName,
      contentType: 'text/plain',
    });
    
    // Make the upload request
    const uploadResponse = await fetch('http://localhost:3000/api/files', {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        ...form.getHeaders(),
      },
      body: form,
    });
    
    console.log('\nUpload response status:', uploadResponse.status);
    
    const result = await uploadResponse.json();
    console.log('Upload response:', JSON.stringify(result, null, 2));
    
    if (uploadResponse.ok && result.uploadedFiles) {
      console.log('\n✅ File uploaded successfully!');
      console.log('Uploaded files:', result.uploadedFiles.length);
      
      // Check if file exists in database
      const { neon } = require('@neondatabase/serverless');
      require('dotenv').config({ path: '.env.local' });
      const sql = neon(process.env.DATABASE_URL);
      
      const dbFiles = await sql`
        SELECT id, original_name, file_path, created_at 
        FROM files 
        WHERE original_name = ${testFileName}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      if (dbFiles.length > 0) {
        console.log('\n✅ File found in database!');
        console.log(`- ID: ${dbFiles[0].id}`);
        console.log(`- Path: ${dbFiles[0].file_path}`);
        
        // Clean up - delete from database
        await sql`DELETE FROM files WHERE id = ${dbFiles[0].id}`;
        console.log('✅ Cleaned up database record');
      } else {
        console.log('\n❌ File NOT found in database!');
      }
    } else {
      console.log('\n❌ Upload failed!');
      if (result.error) {
        console.log('Error:', result.error);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('\n✅ Cleaned up test file');
    }
  }
}

// Check if server is running
fetch('http://localhost:3000/api/auth/providers')
  .then(() => {
    console.log('✅ Server is running on port 3000\n');
    return testFileAPI();
  })
  .catch(() => {
    console.log('❌ Server is not running on port 3000');
    console.log('Please start the dev server with: npm run dev');
  })
  .then(() => process.exit(0));