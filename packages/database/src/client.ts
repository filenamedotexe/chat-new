import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Get database URL at initialization time
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy';

// Create the SQL client
const sql = neon(databaseUrl);

// Create and export the database instance
export const db = drizzle(sql);

export type Database = typeof db;