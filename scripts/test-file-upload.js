const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function testFileUpload() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('=== Testing File Upload Process ===\n');
    
    // First, check if we have a test user
    const users = await sql`
      SELECT id, email, role 
      FROM users 
      WHERE email = 'admin@example.com' 
      LIMIT 1
    `;
    
    if (users.length === 0) {
      console.log('❌ No admin user found!');
      return;
    }
    
    const adminUser = users[0];
    console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.id})`);
    
    // Check if we have any projects
    const projects = await sql`
      SELECT id, name 
      FROM projects 
      LIMIT 1
    `;
    
    const projectId = projects.length > 0 ? projects[0].id : null;
    if (projectId) {
      console.log(`✅ Found project: ${projects[0].name} (${projectId})`);
    } else {
      console.log('⚠️  No projects found, will create file without project association');
    }
    
    // Try to insert a test file record
    console.log('\n--- Attempting to insert test file record ---');
    
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
          project_id,
          uploaded_by_id
        ) VALUES (
          'test-file.jpg',
          'test-123-unique.jpg',
          'image/jpeg',
          'image',
          1024,
          'local',
          '/uploads/2025/07/test-123-unique.jpg',
          ${projectId},
          ${adminUser.id}
        )
        RETURNING *
      `;
      
      console.log('✅ Successfully inserted test file!');
      console.log('File ID:', testFile[0].id);
      
      // Now delete it
      await sql`DELETE FROM files WHERE id = ${testFile[0].id}`;
      console.log('✅ Cleaned up test file');
      
    } catch (insertError) {
      console.log('❌ Failed to insert file:', insertError.message);
      console.log('Error code:', insertError.code);
      console.log('Error detail:', insertError.detail);
      
      // Check specific constraint violations
      if (insertError.code === '23503') {
        console.log('\n⚠️  Foreign key constraint violation!');
        console.log('This might mean the uploaded_by_id user doesn\'t exist');
      } else if (insertError.code === '23514') {
        console.log('\n⚠️  Check constraint violation!');
        console.log('The files_association_check constraint might be failing');
      }
    }
    
    // Check the constraint specifically
    console.log('\n--- Checking table constraints ---');
    const constraints = await sql`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'files'::regclass
      AND contype = 'c'
    `;
    
    console.log('Check constraints on files table:');
    constraints.forEach(c => {
      console.log(`- ${c.constraint_name}: ${c.constraint_definition}`);
    });
    
    // Check if the uploaded_by_id column allows NULL
    const columnInfo = await sql`
      SELECT column_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'files'
      AND column_name = 'uploaded_by_id'
    `;
    
    console.log('\nuploaded_by_id column info:');
    console.log(`- Nullable: ${columnInfo[0].is_nullable}`);
    console.log(`- Default: ${columnInfo[0].column_default || 'None'}`);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFileUpload().then(() => process.exit(0));