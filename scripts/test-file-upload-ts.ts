import { createFile } from '@/features/files/data/files';
import { db } from '@chat/database';
import { files } from '@/packages/database/src/schema/files';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function testFileUploadComplete() {
  console.log('=== Testing File Upload with TypeScript ===\n');
  
  try {
    // 1. Get admin user
    console.log('1. Getting admin user...');
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'admin@example.com'),
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.id})`);
    
    // 2. Test createFile function
    console.log('\n2. Testing createFile function...');
    
    try {
      const testBuffer = Buffer.from('Test file content for TypeScript test');
      const createdFile = await createFile({
        originalName: 'test-typescript.txt',
        mimeType: 'text/plain',
        buffer: testBuffer,
        uploadedById: adminUser.id,
      });
      
      console.log('✅ createFile function successful!');
      console.log(`   File ID: ${createdFile.id}`);
      console.log(`   File path: ${createdFile.filePath}`);
      
      // Check if file exists on disk
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
      await db.delete(files).where(eq(files.id, createdFile.id));
      console.log('✅ Cleaned up database record');
      
    } catch (createError: any) {
      console.log('❌ createFile function failed:', createError.message);
      console.log('Stack:', createError.stack);
    }
    
    // 3. Check current file counts
    console.log('\n3. Current file status:');
    const fileCount = await db.select({ count: files.id }).from(files);
    console.log(`   Total files in database: ${fileCount.length}`);
    
  } catch (error: any) {
    console.error('Test failed:', error.message);
  }
}

testFileUploadComplete().then(() => {
  console.log('\nTest complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});