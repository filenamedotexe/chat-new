import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// For build time, we'll use a dummy URL if DATABASE_URL is not set
// The actual connection will fail at runtime if DATABASE_URL is not provided
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy';

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('DATABASE_URL environment variable is not set. Database operations will fail at runtime.');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);

export type Database = typeof db;