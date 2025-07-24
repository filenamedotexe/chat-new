const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function debugFileUpload() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('=== Debugging File Upload Issue ===\n');
  
  try {
    // 1. Check if there are any files in the database at all
    const allFiles = await sql`
      SELECT 
        f.id,
        f.original_name,
        f.file_path,
        f.created_at,
        f.uploaded_by_id,
        u.email as uploader_email
      FROM files f
      LEFT JOIN users u ON f.uploaded_by_id = u.id
      ORDER BY f.created_at DESC
    `;
    
    console.log(`Total files in database: ${allFiles.length}`);
    
    if (allFiles.length > 0) {
      console.log('\nExisting files:');
      allFiles.forEach(file => {
        console.log(`- ${file.original_name} (${file.file_path})`);
        console.log(`  Uploaded by: ${file.uploader_email || 'Unknown'} at ${new Date(file.created_at).toLocaleString()}`);
      });
    }
    
    // 2. Check physical files
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    console.log('\n--- Physical Files ---');
    const walkDir = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item);
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath, relPath);
        } else {
          const stats = fs.statSync(fullPath);
          console.log(`- /uploads/${relPath.replace(/\\/g, '/')} (${(stats.size / 1024).toFixed(2)} KB)`);
        }
      });
    };
    
    if (fs.existsSync(uploadsDir)) {
      walkDir(uploadsDir);
    }
    
    // 3. Try to match physical files with database records
    console.log('\n--- Orphaned Physical Files ---');
    const findOrphanedFiles = async (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item);
        if (fs.statSync(fullPath).isDirectory()) {
          await findOrphanedFiles(fullPath, relPath);
        } else {
          const webPath = `/uploads/${relPath.replace(/\\/g, '/')}`;
          const dbFile = await sql`
            SELECT id FROM files 
            WHERE file_path = ${webPath}
            LIMIT 1
          `;
          
          if (dbFile.length === 0) {
            console.log(`- ${webPath} (NO DATABASE RECORD)`);
          }
        }
      }
    };
    
    if (fs.existsSync(uploadsDir)) {
      await findOrphanedFiles(uploadsDir);
    }
    
    // 4. Check recent error patterns
    console.log('\n--- Checking for Common Issues ---');
    
    // Check if uploaded_by_id constraint is the issue
    const nullUploaderFiles = await sql`
      SELECT COUNT(*) as count 
      FROM files 
      WHERE uploaded_by_id IS NULL
    `;
    
    if (nullUploaderFiles[0].count > 0) {
      console.log(`⚠️  Found ${nullUploaderFiles[0].count} files with NULL uploaded_by_id`);
    }
    
    // Check for any files with invalid foreign keys
    const orphanedByUser = await sql`
      SELECT COUNT(*) as count
      FROM files f
      WHERE NOT EXISTS (
        SELECT 1 FROM users u WHERE u.id = f.uploaded_by_id
      )
      AND f.uploaded_by_id IS NOT NULL
    `;
    
    if (orphanedByUser[0].count > 0) {
      console.log(`⚠️  Found ${orphanedByUser[0].count} files with invalid uploaded_by_id`);
    }
    
    // 5. Test a direct insert with all required fields
    console.log('\n--- Testing Direct Insert ---');
    const adminUser = await sql`
      SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1
    `;
    
    if (adminUser.length > 0) {
      try {
        const testInsert = await sql`
          INSERT INTO files (
            original_name, file_name, mime_type, file_type,
            file_size, storage_type, file_path, uploaded_by_id
          ) VALUES (
            'debug-test.txt', 'debug-123.txt', 'text/plain', 'document',
            100, 'local', '/uploads/debug-123.txt', ${adminUser[0].id}
          )
          RETURNING id
        `;
        
        console.log('✅ Direct insert successful! File ID:', testInsert[0].id);
        
        // Clean up
        await sql`DELETE FROM files WHERE id = ${testInsert[0].id}`;
        console.log('✅ Cleaned up test record');
      } catch (insertError) {
        console.log('❌ Direct insert failed:', insertError.message);
        console.log('Error code:', insertError.code);
      }
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  }
}

debugFileUpload().then(() => process.exit(0));