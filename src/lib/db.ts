import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Sanitize connection string: remove channel_binding if present as it can cause issues with HTTP drivers
const sanitizedUrl = process.env.DATABASE_URL.replace(/[&?]channel_binding=[^&]+/, '');

const sql = neon(sanitizedUrl);
export const db = drizzle(sql, { schema });
