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

    // Split by semicolons, but handle DO blocks specially
    const rawStatements = migrationSQL.split(/;(?![^$]*\$\$)/);
    
    const statements = rawStatements
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.match(/^--.*$/))
      .map(stmt => {
        // Ensure DO blocks end with semicolon
        if (stmt.includes('DO $$') && !stmt.endsWith(';')) {
          return stmt + ';';
        }
        return stmt;
      });

    console.log(`Found ${statements.length} SQL statements to execute.\n`);
    
    // Debug: Show all statements
    console.log('Statements found:');
    statements.forEach((stmt, i) => {
      console.log(`${i + 1}: ${stmt.substring(0, 50).replace(/\n/g, ' ')}...`);
    });
    console.log('');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Show first 100 chars of the statement
      const preview = statement.substring(0, 100).replace(/\n/g, ' ');
      console.log(`Preview: ${preview}${statement.length > 100 ? '...' : ''}`);
      
      try {
        // Execute the statement directly (neon requires a function call with the SQL)
        await sql(statement);
        console.log('✅ Success\n');
      } catch (error: any) {
        // Some errors are expected (e.g., "already exists")
        if (error.message.includes('already exists')) {
          console.log('⚠️  Already exists (skipping)\n');
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Migration completed successfully!');

    // Verify the tables exist
    console.log('\n🔍 Verifying migration...');
    
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