import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import pg from 'pg';
import { config } from './config.js';

/**
 * Applies a SQL file from supabase/migrations to the Supabase Postgres database.
 *
 *   npx tsx server/db-migrate.ts supabase/migrations/20261020000000_railquick_train_requests.sql
 *
 * Reads DATABASE_URL from the environment, falling back to railquick-backend-main/.env.
 * Migrations are written to be idempotent.
 */
async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: tsx server/db-migrate.ts <path-to-sql-file>');
  dotenv.config({ path: path.join(config.root, 'railquick-backend-main', '.env') });
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');

  const sql = fs.readFileSync(path.resolve(config.root, file), 'utf8');

  // The direct host (db.<ref>.supabase.co) is IPv6-only. On IPv4-only networks set
  // SUPABASE_POOLER_HOST=aws-0-<region>.pooler.supabase.com to use the session pooler.
  const direct = new URL(url);
  const poolerHost = process.env.SUPABASE_POOLER_HOST;
  const client = poolerHost
    ? new pg.Client({
        host: poolerHost,
        port: 5432,
        user: `postgres.${direct.hostname.replace(/^db\./, '').split('.')[0]}`,
        password: decodeURIComponent(direct.password),
        database: direct.pathname.replace(/^\//, '') || 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      })
    : new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  await client.connect();
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('commit');
    console.log(`[migrate] applied ${file}`);
  } catch (err) {
    await client.query('rollback').catch(() => undefined);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[migrate] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
