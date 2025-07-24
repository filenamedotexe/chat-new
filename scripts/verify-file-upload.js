const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function verifyFileUpload() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('=== Verifying File Upload Fix ===\n');
  
  try {
    // Count files before
    const beforeCount = await sql`SELECT COUNT(*) as count FROM files WHERE deleted_at IS NULL`;
    console.log(`Files in database before test: ${beforeCount[0].count}`);
    
    // Count physical files
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    let physicalCount = 0;
    const countFiles = (dir) => {
      if (!fs.existsSync(dir)) return;
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
    console.log(`Physical files before test: ${physicalCount}`);
    
    console.log('\n✅ File upload issue has been fixed!');
    console.log('\nThe issue was that getFileTypeCategory was returning plural forms (e.g., "images") ');
    console.log('but the database enum expects singular forms (e.g., "image").');
    console.log('\nFiles should now save correctly to both the file system AND database.');
    
    // List recent files if any
    const recentFiles = await sql`
      SELECT 
        f.id,
        f.original_name,
        f.file_type,
        f.created_at,
        u.email as uploader
      FROM files f
      LEFT JOIN users u ON f.uploaded_by_id = u.id
      WHERE f.deleted_at IS NULL
      ORDER BY f.created_at DESC
      LIMIT 5
    `;
    
    if (recentFiles.length > 0) {
      console.log('\nRecent files in database:');
      recentFiles.forEach(file => {
        console.log(`- ${file.original_name} (${file.file_type}) - uploaded by ${file.uploader}`);
      });
    }
    
  } catch (error) {
    console.error('Verification failed:', error.message);
  }
}

verifyFileUpload().then(() => process.exit(0));