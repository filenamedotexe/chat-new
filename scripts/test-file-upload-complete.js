const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function testFileUploadComplete() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('=== Complete File Upload Test ===\n');
  
  try {
    // 1. Test database connection and user
    console.log('1. Testing database and user...');
    const adminUser = await sql`
      SELECT id, email, role 
      FROM users 
      WHERE email = 'admin@example.com' 
      LIMIT 1
    `;
    
    if (adminUser.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log(`✅ Found admin user: ${adminUser[0].email} (${adminUser[0].id})`);
    
    // 2. Test direct database insert
    console.log('\n2. Testing direct database insert...');
    try {
      const testFile = await sql`
        INSERT INTO files (
          original_name,
          file_name,
          mime_type,
          file_type,
          file_size,
          storage_type,
          file_path,
          uploaded_by_id
        ) VALUES (
          'test-direct.txt',
          'test-direct-123.txt',
          'text/plain',
          'document',
          100,
          'local',
          '/uploads/test-direct-123.txt',
          ${adminUser[0].id}
        )
        RETURNING *
      `;
      
      console.log('✅ Direct database insert successful!');
      console.log(`   File ID: ${testFile[0].id}`);
      
      // Clean up
      await sql`DELETE FROM files WHERE id = ${testFile[0].id}`;
      console.log('✅ Cleaned up test record');
      
    } catch (dbError) {
      console.log('❌ Direct database insert failed:', dbError.message);
      return;
    }
    
    // 3. Test the createFile function from data layer
    console.log('\n3. Testing createFile function...');
    const { createFile } = require('../features/files/data/files.ts');
    
    try {
      const testBuffer = Buffer.from('Test file content for createFile test');
      const createdFile = await createFile({
        originalName: 'test-createfile.txt',
        mimeType: 'text/plain',
        buffer: testBuffer,
        uploadedById: adminUser[0].id,
      });
      
      console.log('✅ createFile function successful!');
      console.log(`   File ID: ${createdFile.id}`);
      console.log(`   File path: ${createdFile.filePath}`);
      
      // Check if file exists on disk
      const fs = require('fs');
      const path = require('path');
      const physicalPath = path.join(process.cwd(), 'public', createdFile.filePath.replace(/^\//, ''));
      
      if (fs.existsSync(physicalPath)) {
        console.log('✅ Physical file exists on disk');
        // Clean up physical file
        fs.unlinkSync(physicalPath);
        console.log('✅ Cleaned up physical file');
      } else {
        console.log('❌ Physical file NOT found on disk!');
      }
      
      // Clean up database record
      await sql`DELETE FROM files WHERE id = ${createdFile.id}`;
      console.log('✅ Cleaned up database record');
      
    } catch (createError) {
      console.log('❌ createFile function failed:', createError.message);
      console.log('Stack:', createError.stack);
    }
    
    // 4. Check file system permissions
    console.log('\n4. Checking file system permissions...');
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      // Test write permission
      const testPath = path.join(uploadsDir, 'permission-test.txt');
      fs.writeFileSync(testPath, 'Permission test');
      console.log('✅ Can write to uploads directory');
      
      // Clean up
      fs.unlinkSync(testPath);
      console.log('✅ Can delete from uploads directory');
      
    } catch (fsError) {
      console.log('❌ File system permission error:', fsError.message);
    }
    
    // 5. List all files in database vs file system
    console.log('\n5. Database vs File System Status:');
    const dbFiles = await sql`
      SELECT COUNT(*) as count FROM files WHERE deleted_at IS NULL
    `;
    console.log(`   Database files: ${dbFiles[0].count}`);
    
    let physicalCount = 0;
    const countFiles = (dir) => {
      if (!fs.existsSync(dir)) return 0;
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          countFiles(fullPath);
        } else {
          physicalCount++;
        }
      });
    };
    
    countFiles(uploadsDir);
    console.log(`   Physical files: ${physicalCount}`);
    
    if (dbFiles[0].count === physicalCount) {
      console.log('✅ Database and file system are in sync');
    } else {
      console.log('⚠️  Database and file system are NOT in sync');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFileUploadComplete().then(() => process.exit(0));