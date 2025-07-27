// Export schema from Neon database
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function exportSchema() {
  console.log('🔍 Exporting schema from Neon database...');
  
  try {
    // Get all tables
    const tables = await sql`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`Found ${tables.length} tables:`, tables.map(t => t.table_name));
    
    let schemaOutput = `-- Current Neon Database Schema Export
-- Generated: ${new Date().toISOString()}
-- Database: ${databaseUrl.split('@')[1].split('/')[0]}

`;

    // Get table structures
    for (const table of tables) {
      console.log(`Exporting table: ${table.table_name}`);
      
      // Get columns
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = ${table.table_name} AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      schemaOutput += `\n-- Table: ${table.table_name}\n`;
      schemaOutput += `CREATE TABLE IF NOT EXISTS public.${table.table_name} (\n`;
      
      const columnDefs = columns.map(col => {
        let def = `  ${col.column_name} ${col.data_type}`;
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        return def;
      });
      
      schemaOutput += columnDefs.join(',\n');
      schemaOutput += '\n);\n';
      
      // Get indexes
      const indexes = await sql`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = ${table.table_name} AND schemaname = 'public'
      `;
      
      if (indexes.length > 0) {
        schemaOutput += `\n-- Indexes for ${table.table_name}\n`;
        indexes.forEach(idx => {
          if (!idx.indexname.includes('_pkey')) { // Skip primary key indexes
            schemaOutput += `${idx.indexdef};\n`;
          }
        });
      }
    }
    
    // Get foreign key constraints
    const constraints = await sql`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `;
    
    if (constraints.length > 0) {
      schemaOutput += `\n-- Foreign Key Constraints\n`;
      constraints.forEach(fk => {
        schemaOutput += `ALTER TABLE ONLY public.${fk.table_name}
    ADD CONSTRAINT ${fk.constraint_name} FOREIGN KEY (${fk.column_name}) REFERENCES public.${fk.foreign_table_name}(${fk.foreign_column_name});\n`;
      });
    }
    
    // Write to file
    fs.writeFileSync('current_schema.sql', schemaOutput);
    console.log('✅ Schema exported to current_schema.sql');
    
    // Also get sample data counts
    console.log('\n📊 Table row counts:');
    for (const table of tables) {
      try {
        const count = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`;
        console.log(`  ${table.table_name}: ${count[0].count} rows`);
      } catch (e) {
        console.log(`  ${table.table_name}: Error getting count`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error exporting schema:', error);
    process.exit(1);
  }
}

exportSchema();