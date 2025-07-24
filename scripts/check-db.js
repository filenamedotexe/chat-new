const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Check if messages table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'messages'
    `;
    
    console.log('Messages table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check table structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'messages'
        ORDER BY ordinal_position
      `;
      
      console.log('\nMessages table columns:');
      columns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Count messages
      const count = await sql`SELECT COUNT(*) as count FROM messages`;
      console.log('\nTotal messages:', count[0].count);
      
      // Check sample data
      const messages = await sql`
        SELECT id, content, sender_id, project_id, task_id, created_at 
        FROM messages 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      
      console.log('\nRecent messages:', messages.length);
      messages.forEach(msg => {
        console.log(`- ${msg.content.substring(0, 50)}... (${new Date(msg.created_at).toLocaleString()})`);
      });
    } else {
      console.log('\n❌ Messages table does not exist!');
      console.log('Run: psql $DATABASE_URL -f migrations/004_add_messages_table.sql');
    }
    
    // Check if we have any projects and tasks
    const projects = await sql`SELECT id, name FROM projects LIMIT 3`;
    console.log('\nSample projects:');
    projects.forEach(p => console.log(`- ${p.id}: ${p.name}`));
    
    const tasks = await sql`SELECT id, title, project_id FROM tasks LIMIT 3`;
    console.log('\nSample tasks:');
    tasks.forEach(t => console.log(`- ${t.id}: ${t.title}`));
    
    const users = await sql`SELECT id, email, role FROM users WHERE role != 'user' LIMIT 3`;
    console.log('\nSample non-user accounts:');
    users.forEach(u => console.log(`- ${u.id}: ${u.email} (${u.role})`));
    
  } catch (error) {
    console.error('Database check failed:', error.message);
    if (error.code === '42P01') {
      console.log('\n❌ Table does not exist');
    } else if (error.code === '23503') {
      console.log('\n❌ Foreign key constraint violation');
    }
  }
}

checkDatabase().then(() => process.exit(0));