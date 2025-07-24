const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function cleanupOrphanedFiles() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('=== Cleaning Up Orphaned Files ===\n');
  
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Find all physical files
    const physicalFiles = [];
    const walkDir = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item);
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath, relPath);
        } else {
          physicalFiles.push({
            fullPath,
            webPath: `/uploads/${relPath.replace(/\\/g, '/')}`,
            fileName: item
          });
        }
      });
    };
    
    if (fs.existsSync(uploadsDir)) {
      walkDir(uploadsDir);
    }
    
    console.log(`Found ${physicalFiles.length} physical files\n`);
    
    // Check each file against database
    let orphanedCount = 0;
    for (const file of physicalFiles) {
      const dbFile = await sql`
        SELECT id FROM files 
        WHERE file_path = ${file.webPath}
        LIMIT 1
      `;
      
      if (dbFile.length === 0) {
        console.log(`Orphaned file: ${file.webPath}`);
        
        // Ask for confirmation before deleting
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          rl.question(`Delete this file? (y/N): `, resolve);
        });
        rl.close();
        
        if (answer.toLowerCase() === 'y') {
          fs.unlinkSync(file.fullPath);
          console.log('✅ Deleted\n');
          orphanedCount++;
        } else {
          console.log('⏭️  Skipped\n');
        }
      }
    }
    
    console.log(`\nCleanup complete. Deleted ${orphanedCount} orphaned files.`);
    
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  }
}

cleanupOrphanedFiles().then(() => process.exit(0));