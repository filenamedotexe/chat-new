#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create PostgreSQL client for direct database access
const dbClient = new Client({
  connectionString: process.env.DATABASE_URL
});

async function getFileExtension(filename) {
  const ext = path.extname(filename);
  return ext || '.txt'; // Default to .txt if no extension
}

async function migrateFilesToSupabase() {
  console.log('🚀 Starting file migration to Supabase Storage...');
  
  try {
    // Connect to database
    await dbClient.connect();
    console.log('✅ Connected to database');
    
    // Get all files from database that are still using local storage
    const { rows: files } = await dbClient.query(`
      SELECT 
        id, 
        original_name, 
        file_name, 
        file_path, 
        mime_type,
        file_type,
        file_size,
        uploaded_by_id,
        project_id,
        task_id,
        storage_type
      FROM files 
      WHERE storage_type = 'local' 
      AND deleted_at IS NULL
      ORDER BY created_at ASC
    `);
    
    console.log(`📁 Found ${files.length} files to migrate`);
    
    if (files.length === 0) {
      console.log('🎉 No files to migrate!');
      return;
    }
    
    let migratedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const file of files) {
      try {
        console.log(`\n📤 Migrating: ${file.original_name}`);
        
        // Construct local file path
        const localFilePath = path.join(process.cwd(), 'public', file.file_path);
        
        // Check if local file exists
        if (!fs.existsSync(localFilePath)) {
          console.log(`  ⚠️  Local file not found: ${localFilePath}`);
          errors.push({
            fileId: file.id,
            fileName: file.original_name,
            error: 'Local file not found'
          });
          errorCount++;
          continue;
        }
        
        // Read file content
        const fileBuffer = fs.readFileSync(localFilePath);
        console.log(`  📊 File size: ${fileBuffer.length} bytes`);
        
        // Generate Supabase storage path
        // Structure: user-uploads/{user_id}/{project_id}/{file_id}{extension}
        const fileExtension = await getFileExtension(file.original_name);
        const storagePath = file.project_id 
          ? `${file.uploaded_by_id}/${file.project_id}/${file.id}${fileExtension}`
          : `${file.uploaded_by_id}/general/${file.id}${fileExtension}`;
        
        console.log(`  📍 Uploading to: user-uploads/${storagePath}`);
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(storagePath, fileBuffer, {
            contentType: file.mime_type,
            upsert: true // Overwrite if exists
          });
        
        if (uploadError) {
          console.log(`  ❌ Upload failed: ${uploadError.message}`);
          errors.push({
            fileId: file.id,
            fileName: file.original_name,
            error: uploadError.message
          });
          errorCount++;
          continue;
        }
        
        console.log(`  ✅ Uploaded successfully to: ${uploadData.path}`);
        
        // Update database record with new storage information
        const { rowCount } = await dbClient.query(`
          UPDATE files 
          SET 
            storage_type = 'supabase',
            file_path = $1,
            s3_key = $2,
            updated_at = NOW()
          WHERE id = $3
        `, [
          uploadData.path,
          uploadData.path, // Using s3_key field for Supabase path
          file.id
        ]);
        
        if (rowCount === 1) {
          console.log(`  ✅ Database updated successfully`);
          migratedCount++;
        } else {
          console.log(`  ⚠️  Database update failed`);
          errors.push({
            fileId: file.id,
            fileName: file.original_name,
            error: 'Database update failed'
          });
          errorCount++;
        }
        
        // Optional: Remove local file after successful migration
        // Uncomment the following lines if you want to delete local files
        // try {
        //   fs.unlinkSync(localFilePath);
        //   console.log(`  🗑️  Local file removed: ${localFilePath}`);
        // } catch (deleteError) {
        //   console.log(`  ⚠️  Could not remove local file: ${deleteError.message}`);
        // }
        
      } catch (error) {
        console.log(`  ❌ Migration failed: ${error.message}`);
        errors.push({
          fileId: file.id,
          fileName: file.original_name,
          error: error.message
        });
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} files`);
    console.log(`❌ Failed migrations: ${errorCount} files`);
    
    if (errors.length > 0) {
      console.log('\n❌ Migration Errors:');
      errors.forEach(error => {
        console.log(`  - ${error.fileName} (${error.fileId}): ${error.error}`);
      });
    }
    
    console.log('\n🎉 File migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

// Add a dry-run option
if (process.argv.includes('--dry-run')) {
  console.log('🧪 DRY RUN MODE - No files will be actually migrated');
  // Add dry-run logic here if needed
} else {
  migrateFilesToSupabase().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}