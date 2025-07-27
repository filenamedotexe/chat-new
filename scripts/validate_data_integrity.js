// Data Integrity Validation Script
// Compares Neon and Supabase data to ensure migration integrity

import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize connections
const neonSql = neon(process.env.DATABASE_URL);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TABLES_TO_VALIDATE = [
  'users', 'features', 'organizations', 'organization_members',
  'projects', 'tasks', 'conversations', 'messages', 'files', 'activity_logs'
];

async function validateTableCounts() {
  console.log('📊 Validating table record counts...\n');
  
  const results = {};
  let allMatch = true;
  
  for (const tableName of TABLES_TO_VALIDATE) {
    try {
      // Get Neon count
      const neonCountResult = await neonSql(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const neonCount = parseInt(neonCountResult[0].count);
      
      // Get Supabase count
      const { count: supabaseCount, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Error counting ${tableName} in Supabase:`, error);
        results[tableName] = { neon: neonCount, supabase: 'ERROR', match: false };
        allMatch = false;
        continue;
      }
      
      const match = neonCount === supabaseCount;
      if (!match) allMatch = false;
      
      const status = match ? '✅' : '❌';
      console.log(`${status} ${tableName}: Neon=${neonCount}, Supabase=${supabaseCount}`);
      
      results[tableName] = { neon: neonCount, supabase: supabaseCount, match };
      
    } catch (error) {
      console.error(`❌ Error validating ${tableName}:`, error);
      results[tableName] = { neon: 'ERROR', supabase: 'ERROR', match: false };
      allMatch = false;
    }
  }
  
  console.log(`\n📈 Count validation: ${allMatch ? 'PASSED' : 'FAILED'}`);
  return { allMatch, results };
}

async function validateSampleRecords() {
  console.log('\n🔍 Validating sample record integrity...\n');
  
  const validationResults = {};
  let allValid = true;
  
  for (const tableName of TABLES_TO_VALIDATE) {
    try {
      // Get sample records from Neon
      const neonRecords = await neonSql(`SELECT * FROM "${tableName}" ORDER BY created_at LIMIT 3`);
      
      if (neonRecords.length === 0) {
        console.log(`⚠️  ${tableName}: No records to validate`);
        validationResults[tableName] = { status: 'empty', matches: 0, total: 0 };
        continue;
      }
      
      let matches = 0;
      
      for (const neonRecord of neonRecords) {
        // Find corresponding record in Supabase
        const { data: supabaseRecords, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', neonRecord.id)
          .limit(1);
        
        if (error) {
          console.error(`❌ Error fetching ${tableName} record ${neonRecord.id}:`, error);
          allValid = false;
          continue;
        }
        
        if (supabaseRecords.length === 0) {
          console.error(`❌ ${tableName}: Record ${neonRecord.id} not found in Supabase`);
          allValid = false;
          continue;
        }
        
        const supabaseRecord = supabaseRecords[0];
        
        // Compare key fields (excluding timestamps that might have precision differences)
        const keysToCompare = Object.keys(neonRecord).filter(key => 
          !['created_at', 'updated_at', 'password_hash'].includes(key)
        );
        
        let recordValid = true;
        for (const key of keysToCompare) {
          const neonValue = neonRecord[key];
          const supabaseValue = supabaseRecord[key];
          
          // Handle JSON fields
          if (typeof neonValue === 'object' && neonValue !== null) {
            if (JSON.stringify(neonValue) !== JSON.stringify(supabaseValue)) {
              console.error(`❌ ${tableName}.${key} mismatch for ID ${neonRecord.id}`);
              console.error(`   Neon: ${JSON.stringify(neonValue)}`);
              console.error(`   Supabase: ${JSON.stringify(supabaseValue)}`);
              recordValid = false;
              allValid = false;
            }
          } else if (neonValue !== supabaseValue) {
            // Handle null vs undefined
            if (!(neonValue == null && supabaseValue == null)) {
              console.error(`❌ ${tableName}.${key} mismatch for ID ${neonRecord.id}`);
              console.error(`   Neon: ${neonValue} (${typeof neonValue})`);
              console.error(`   Supabase: ${supabaseValue} (${typeof supabaseValue})`);
              recordValid = false;
              allValid = false;
            }
          }
        }
        
        if (recordValid) {
          matches++;
        }
      }
      
      const status = matches === neonRecords.length ? '✅' : '❌';
      console.log(`${status} ${tableName}: ${matches}/${neonRecords.length} records match`);
      
      validationResults[tableName] = {
        status: matches === neonRecords.length ? 'valid' : 'invalid',
        matches,
        total: neonRecords.length
      };
      
    } catch (error) {
      console.error(`❌ Error validating ${tableName} records:`, error);
      validationResults[tableName] = { status: 'error', matches: 0, total: 0 };
      allValid = false;
    }
  }
  
  console.log(`\n🔍 Record validation: ${allValid ? 'PASSED' : 'FAILED'}`);
  return { allValid, results: validationResults };
}

async function validateForeignKeys() {
  console.log('\n🔗 Validating foreign key relationships...\n');
  
  const foreignKeys = [
    { table: 'organization_members', column: 'organization_id', refTable: 'organizations' },
    { table: 'organization_members', column: 'user_id', refTable: 'users' },
    { table: 'projects', column: 'organization_id', refTable: 'organizations' },
    { table: 'tasks', column: 'project_id', refTable: 'projects' },
    { table: 'tasks', column: 'assigned_to_id', refTable: 'users' },
    { table: 'tasks', column: 'created_by_id', refTable: 'users' },
    { table: 'files', column: 'project_id', refTable: 'projects' },
    { table: 'files', column: 'task_id', refTable: 'tasks' },
    { table: 'files', column: 'uploaded_by_id', refTable: 'users' },
    { table: 'activity_logs', column: 'user_id', refTable: 'users' },
    { table: 'activity_logs', column: 'project_id', refTable: 'projects' },
    { table: 'activity_logs', column: 'task_id', refTable: 'tasks' }
  ];
  
  let allValid = true;
  
  for (const fk of foreignKeys) {
    try {
      const { data: orphans, error } = await supabase
        .from(fk.table)
        .select(`${fk.column}`)
        .not(`${fk.column}`, 'is', null)
        .not(`${fk.column}`, 'in', 
          `(SELECT id FROM ${fk.refTable})`
        );
      
      if (error) {
        console.error(`❌ Error checking FK ${fk.table}.${fk.column}:`, error);
        allValid = false;
        continue;
      }
      
      if (orphans && orphans.length > 0) {
        console.error(`❌ ${fk.table}.${fk.column} → ${fk.refTable}: ${orphans.length} orphaned records`);
        allValid = false;
      } else {
        console.log(`✅ ${fk.table}.${fk.column} → ${fk.refTable}: All references valid`);
      }
      
    } catch (error) {
      console.error(`❌ Error validating FK ${fk.table}.${fk.column}:`, error);
      allValid = false;
    }
  }
  
  console.log(`\n🔗 Foreign key validation: ${allValid ? 'PASSED' : 'FAILED'}`);
  return allValid;
}

async function validateSpecialCases() {
  console.log('\n🔬 Validating special cases...\n');
  
  let allValid = true;
  
  try {
    // Check that admin user exists
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .eq('role', 'admin');
    
    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.error('❌ Admin user (admin@example.com) not found in Supabase');
      allValid = false;
    } else {
      console.log('✅ Admin user found in Supabase');
    }
    
    // Check that organization memberships exist
    const { data: memberships, error: memberError } = await supabase
      .from('organization_members')
      .select('*');
    
    if (memberError || !memberships || memberships.length === 0) {
      console.error('❌ No organization memberships found in Supabase');
      allValid = false;
    } else {
      console.log(`✅ ${memberships.length} organization memberships found`);
    }
    
    // Check that files have correct storage_type
    const { data: files, error: fileError } = await supabase
      .from('files')
      .select('storage_type')
      .neq('storage_type', 'supabase');
    
    if (fileError) {
      console.error('❌ Error checking file storage types:', fileError);
      allValid = false;
    } else if (files && files.length > 0) {
      console.error(`❌ ${files.length} files don't have storage_type='supabase'`);
      allValid = false;
    } else {
      console.log('✅ All files have correct storage_type');
    }
    
  } catch (error) {
    console.error('❌ Error in special case validation:', error);
    allValid = false;
  }
  
  console.log(`\n🔬 Special cases validation: ${allValid ? 'PASSED' : 'FAILED'}`);
  return allValid;
}

async function runValidation() {
  console.log('🔍 Starting data integrity validation...');
  console.log(`📅 ${new Date().toISOString()}\n`);
  
  // Test connections
  try {
    await neonSql`SELECT 1`;
    const { data } = await supabase.from('users').select('id').limit(1);
    console.log('✅ Database connections validated\n');
  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  }
  
  // Run all validations
  const countValidation = await validateTableCounts();
  const recordValidation = await validateSampleRecords();
  const fkValidation = await validateForeignKeys();
  const specialValidation = await validateSpecialCases();
  
  // Final summary
  const overallValid = countValidation.allMatch && 
                      recordValidation.allValid && 
                      fkValidation && 
                      specialValidation;
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Count validation:     ${countValidation.allMatch ? 'PASSED' : 'FAILED'}`);
  console.log(`Record validation:    ${recordValidation.allValid ? 'PASSED' : 'FAILED'}`);
  console.log(`Foreign key validation: ${fkValidation ? 'PASSED' : 'FAILED'}`);
  console.log(`Special cases:        ${specialValidation ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(50));
  console.log(`OVERALL RESULT:       ${overallValid ? '🎉 PASSED' : '💥 FAILED'}`);
  console.log('='.repeat(50));
  
  if (overallValid) {
    console.log('\n✅ Data migration integrity validated successfully!');
    console.log('🚀 Ready for application cutover to Supabase.');
  } else {
    console.log('\n❌ Data migration validation failed!');
    console.log('🔧 Please review and fix issues before proceeding.');
    process.exit(1);
  }
}

// Run validation
runValidation().catch(console.error);