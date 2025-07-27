// Data Migration Script: Neon → Supabase
// Migrates all existing data while preserving relationships and UUIDs

import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize connections
const neonSql = neon(process.env.DATABASE_URL); // Neon database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Migration order (respecting foreign key dependencies)
const MIGRATION_ORDER = [
  'users',           // No dependencies
  'features',        // No dependencies  
  'organizations',   // No dependencies
  'organization_members', // Depends on users, organizations
  'projects',        // Depends on organizations
  'tasks',           // Depends on projects, users
  'conversations',   // Depends on users
  'messages',        // Depends on conversations, projects, tasks, users
  'files',           // Depends on projects, tasks, users
  'sessions',        // Depends on users
  'activity_logs'    // Depends on users, projects, tasks
];

// Data transformers for schema differences
const TRANSFORMERS = {
  users: (record) => ({
    id: record.id,
    email: record.email,
    name: record.name,
    role: record.role,
    created_at: record.created_at,
    updated_at: record.updated_at,
    email_verified: record.email_verified,
    image: record.image
    // Note: password_hash excluded - Supabase Auth will handle this
  }),
  
  features: (record) => ({
    id: record.id,
    name: record.name,
    description: record.description,
    enabled: record.enabled,
    enabled_for: record.enabled_for,
    created_at: record.created_at,
    updated_at: record.updated_at
  }),
  
  organizations: (record) => ({
    id: record.id,
    name: record.name,
    slug: record.slug,
    type: record.type,
    description: record.description,
    logo: record.logo,
    website: record.website,
    contact_email: record.contact_email,
    contact_phone: record.contact_phone,
    address: record.address,
    created_at: record.created_at,
    updated_at: record.updated_at
  }),
  
  organization_members: (record) => ({
    id: record.id,
    organization_id: record.organization_id,
    user_id: record.user_id,
    created_at: record.created_at
  }),
  
  projects: (record) => ({
    id: record.id,
    organization_id: record.organization_id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    status: record.status,
    start_date: record.start_date,
    end_date: record.end_date,
    created_at: record.created_at,
    updated_at: record.updated_at
  }),
  
  tasks: (record) => ({
    id: record.id,
    project_id: record.project_id,
    title: record.title,
    description: record.description,
    status: record.status,
    assigned_to_id: record.assigned_to_id,
    created_by_id: record.created_by_id,
    due_date: record.due_date,
    completed_at: record.completed_at,
    created_at: record.created_at,
    updated_at: record.updated_at
  }),
  
  conversations: (record) => ({
    id: record.id,
    client_id: record.client_id,
    status: record.status,
    assigned_to: record.assigned_to,
    priority: record.priority,
    last_message_at: record.last_message_at,
    created_at: record.created_at,
    updated_at: record.updated_at
  }),
  
  messages: (record) => ({
    id: record.id,
    content: record.content,
    type: record.type,
    sender_id: record.sender_id,
    project_id: record.project_id,
    task_id: record.task_id,
    recipient_id: record.recipient_id,
    parent_message_id: record.parent_message_id,
    is_edited: record.is_edited,
    deleted_at: record.deleted_at,
    created_at: record.created_at,
    updated_at: record.updated_at,
    conversation_id: record.conversation_id,
    is_internal_note: record.is_internal_note,
    read_at: record.read_at
  }),
  
  files: (record) => ({
    id: record.id,
    original_name: record.original_name,
    file_name: record.file_name,
    mime_type: record.mime_type,
    file_type: record.file_type,
    file_size: record.file_size,
    storage_type: 'supabase', // Migrate from 'local' to 'supabase'
    file_path: record.file_path,
    s3_key: record.s3_key,
    s3_bucket: record.s3_bucket,
    s3_url: record.s3_url,
    thumbnail_url: record.thumbnail_url,
    project_id: record.project_id,
    task_id: record.task_id,
    uploaded_by_id: record.uploaded_by_id,
    created_at: record.created_at,
    updated_at: record.updated_at,
    deleted_at: record.deleted_at
  }),
  
  sessions: (record) => ({
    id: record.id,
    user_id: record.user_id,
    session_token: record.session_token,
    expires: record.expires,
    created_at: record.created_at
  }),
  
  activity_logs: (record) => ({
    id: record.id,
    user_id: record.user_id,
    user_role: record.user_role,
    user_name: record.user_name,
    action: record.action,
    entity_type: record.entity_type,
    entity_id: record.entity_id,
    entity_name: record.entity_name,
    project_id: record.project_id,
    task_id: record.task_id,
    organization_id: record.organization_id,
    old_values: record.old_values,
    new_values: record.new_values,
    metadata: record.metadata,
    created_at: record.created_at
  })
};

async function migrateTable(tableName, dryRun = false) {
  console.log(`\n📦 Migrating table: ${tableName}`);
  
  try {
    // Export from Neon
    const query = `SELECT * FROM "${tableName}" ORDER BY created_at ASC`;
    const neonData = await neonSql(query);
    
    console.log(`   📊 Found ${neonData.length} records in Neon`);
    
    if (neonData.length === 0) {
      console.log(`   ⚠️  No data to migrate for ${tableName}`);
      return { success: true, migrated: 0, skipped: 0, errors: 0 };
    }
    
    // Transform data
    const transformer = TRANSFORMERS[tableName];
    if (!transformer) {
      throw new Error(`No transformer defined for table: ${tableName}`);
    }
    
    const transformedData = neonData.map(transformer);
    console.log(`   🔄 Transformed ${transformedData.length} records`);
    
    if (dryRun) {
      console.log(`   🧪 DRY RUN - Would insert ${transformedData.length} records`);
      console.log(`   Sample transformed record:`, transformedData[0]);
      return { success: true, migrated: 0, skipped: transformedData.length, errors: 0 };
    }
    
    // Insert to Supabase in batches
    const BATCH_SIZE = 100;
    let migrated = 0;
    let errors = 0;
    
    for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
      const batch = transformedData.slice(i, i + BATCH_SIZE);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`   ❌ Batch error (${i}-${i + batch.length}):`, error);
        errors += batch.length;
      } else {
        migrated += batch.length;
        console.log(`   ✅ Migrated batch: ${i + 1}-${i + batch.length} (${batch.length} records)`);
      }
    }
    
    console.log(`   🎉 Migration complete: ${migrated} migrated, ${errors} errors`);
    return { success: errors === 0, migrated, skipped: 0, errors };
    
  } catch (error) {
    console.error(`   ❌ Migration failed for ${tableName}:`, error);
    return { success: false, migrated: 0, skipped: 0, errors: 1 };
  }
}

async function validateConnection() {
  console.log('🔌 Validating database connections...');
  
  try {
    // Test Neon connection
    const neonTest = await neonSql`SELECT 1 as test`;
    console.log('   ✅ Neon connection successful');
    
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is ok
      throw error;
    }
    console.log('   ✅ Supabase connection successful');
    
    return true;
  } catch (error) {
    console.error('   ❌ Connection validation failed:', error);
    return false;
  }
}

async function clearSupabaseData() {
  console.log('\n🧹 Clearing existing Supabase data...');
  
  // Clear in reverse dependency order
  const clearOrder = [...MIGRATION_ORDER].reverse();
  
  for (const tableName of clearOrder) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        console.error(`   ❌ Failed to clear ${tableName}:`, error);
      } else {
        console.log(`   ✅ Cleared table: ${tableName}`);
      }
    } catch (error) {
      console.error(`   ❌ Error clearing ${tableName}:`, error);
    }
  }
}

async function runMigration(dryRun = false) {
  console.log(`🚀 Starting data migration (${dryRun ? 'DRY RUN' : 'LIVE'})...`);
  console.log(`📅 ${new Date().toISOString()}`);
  
  // Validate connections
  if (!(await validateConnection())) {
    process.exit(1);
  }
  
  // Clear existing data if not dry run
  if (!dryRun) {
    await clearSupabaseData();
  }
  
  // Migrate tables in dependency order
  const results = {};
  let totalMigrated = 0;
  let totalErrors = 0;
  
  for (const tableName of MIGRATION_ORDER) {
    const result = await migrateTable(tableName, dryRun);
    results[tableName] = result;
    totalMigrated += result.migrated;
    totalErrors += result.errors;
    
    if (!result.success) {
      console.error(`💥 Migration failed at table: ${tableName}`);
      break;
    }
  }
  
  // Summary
  console.log(`\n📊 Migration Summary:`);
  console.log(`   Total migrated: ${totalMigrated} records`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Tables processed: ${Object.keys(results).length}`);
  
  Object.entries(results).forEach(([table, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${table}: ${result.migrated} migrated, ${result.errors} errors`);
  });
  
  if (totalErrors === 0 && !dryRun) {
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total records migrated: ${totalMigrated}`);
  } else if (dryRun) {
    console.log(`\n🧪 Dry run completed - ready for live migration`);
  } else {
    console.log(`\n💥 Migration completed with ${totalErrors} errors`);
  }
}

// CLI interface
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');

// Run migration
runMigration(dryRun).catch(console.error);