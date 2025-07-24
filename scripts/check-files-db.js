const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkFilesDatabase() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('=== Checking Files Database Setup ===\n');
    
    // Check if files table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'files'
    `;
    
    console.log('Files table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check table structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'files'
        ORDER BY ordinal_position
      `;
      
      console.log('\nFiles table columns:');
      columns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Check enums
      const fileTypeEnum = await sql`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'file_type')
      `;
      console.log('\nFile type enum values:', fileTypeEnum.map(e => e.enumlabel).join(', '));
      
      const storageTypeEnum = await sql`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'storage_type')
      `;
      console.log('Storage type enum values:', storageTypeEnum.map(e => e.enumlabel).join(', '));
      
      // Count files
      const count = await sql`SELECT COUNT(*) as count FROM files WHERE deleted_at IS NULL`;
      console.log('\nTotal active files:', count[0].count);
      
      // Check sample files
      const files = await sql`
        SELECT 
          f.id, 
          f.original_name, 
          f.file_type,
          f.file_size,
          f.file_path,
          f.created_at,
          u.email as uploader_email,
          p.name as project_name,
          t.title as task_title
        FROM files f
        LEFT JOIN users u ON f.uploaded_by_id = u.id
        LEFT JOIN projects p ON f.project_id = p.id
        LEFT JOIN tasks t ON f.task_id = t.id
        WHERE f.deleted_at IS NULL
        ORDER BY f.created_at DESC 
        LIMIT 5
      `;
      
      console.log('\nRecent files:', files.length);
      files.forEach(file => {
        console.log(`\n- ${file.original_name} (${file.file_type})`);
        console.log(`  Size: ${(file.file_size / 1024).toFixed(2)} KB`);
        console.log(`  Path: ${file.file_path}`);
        console.log(`  Uploaded by: ${file.uploader_email || 'Unknown'}`);
        console.log(`  Project: ${file.project_name || 'None'}`);
        console.log(`  Task: ${file.task_title || 'None'}`);
        console.log(`  Date: ${new Date(file.created_at).toLocaleString()}`);
      });
      
      // Check for any orphaned files (no uploader)
      const orphaned = await sql`
        SELECT COUNT(*) as count 
        FROM files 
        WHERE uploaded_by_id IS NULL 
        AND deleted_at IS NULL
      `;
      if (orphaned[0].count > 0) {
        console.log(`\n⚠️  Found ${orphaned[0].count} orphaned files with no uploader`);
      }
      
      // Check file system vs database consistency
      console.log('\n=== File System Check ===');
      const fs = require('fs');
      const path = require('path');
      
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (fs.existsSync(uploadsDir)) {
        const walkDir = (dir, level = 0) => {
          let fileCount = 0;
          const items = fs.readdirSync(dir);
          items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
              fileCount += walkDir(fullPath, level + 1);
            } else {
              fileCount++;
            }
          });
          return fileCount;
        };
        
        const physicalFileCount = walkDir(uploadsDir);
        console.log(`Physical files in uploads directory: ${physicalFileCount}`);
        console.log(`Database file records: ${count[0].count}`);
        
        if (physicalFileCount !== parseInt(count[0].count)) {
          console.log('⚠️  Mismatch between physical files and database records!');
        } else {
          console.log('✅ File system and database are in sync');
        }
      } else {
        console.log('❌ Uploads directory does not exist!');
      }
      
    } else {
      console.log('\n❌ Files table does not exist!');
      console.log('Run: psql $DATABASE_URL -f migrations/003_add_files_table.sql');
    }
    
  } catch (error) {
    console.error('Database check failed:', error.message);
    if (error.code === '42P01') {
      console.log('\n❌ Table does not exist');
      console.log('Run the migration: psql $DATABASE_URL -f migrations/003_add_files_table.sql');
    } else if (error.code === '42704') {
      console.log('\n❌ Type does not exist (missing enums)');
      console.log('Run the migration: psql $DATABASE_URL -f migrations/003_add_files_table.sql');
    }
  }
}

checkFilesDatabase().then(() => process.exit(0));