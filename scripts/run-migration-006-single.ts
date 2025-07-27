import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Load env vars explicitly
config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

// Create SQL client directly
const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Running migration 006_add_support_chat_tables.sql...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '006_add_support_chat_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Executing migration as a single transaction...\n');
    
    // Execute the entire migration file as one statement
    // This allows PostgreSQL to handle the parsing of DO blocks correctly
    await sql`BEGIN`;
    
    try {
      // Execute the migration
      await sql(migrationSQL);
      
      // Commit the transaction
      await sql`COMMIT`;
      
      console.log('✅ Migration completed successfully!\n');
      
      // Verify the migration
      console.log('🔍 Verifying migration...');
      
      const conversationsCheck = await sql`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'conversations'
      `;
      console.log(`✅ Conversations table exists: ${conversationsCheck[0].count > 0}`);

      const columnsCheck = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'messages' 
        AND column_name IN ('conversation_id', 'is_internal_note', 'read_at')
      `;
      console.log(`✅ New message columns added: ${columnsCheck.length} columns found`);
      
      const enumsCheck = await sql`
        SELECT typname FROM pg_type 
        WHERE typname IN ('conversation_status', 'conversation_priority')
      `;
      console.log(`✅ Enums created: ${enumsCheck.length} enums found`);
      
    } catch (error) {
      // Rollback on error
      await sql`ROLLBACK`;
      throw error;
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}