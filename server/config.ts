import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env.local'), override: true });
dotenv.config({ path: path.join(root, '.env'), override: true });

/** Server-side configuration. Secrets live here only and are never sent to the browser. */
export const config = {
  root,
  port: Number(process.env.PORT ?? 8787),
  railkitApiKey: (process.env.RAILKIT_API_KEY ?? '').trim(),
  sessionSecret: process.env.SESSION_SECRET ?? '',
  /** Phone login without OTP is a TESTING aid only; it must be opted into explicitly. */
  testAuthEnabled: process.env.ENABLE_TEST_AUTH === 'true',
  googleAuthEnabled: process.env.ENABLE_GOOGLE_AUTH !== 'false',
  googleClientId: (process.env.GOOGLE_CLIENT_ID ?? process.env.VITE_GOOGLE_CLIENT_ID ?? '').trim(),
  dbPath: process.env.DB_PATH ?? path.join(root, 'server', 'data', 'railquick.db'),
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS ?? 15000),
  /** Supabase (server-side only). The service-role key bypasses RLS and must never reach the browser. */
  supabaseUrl: (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/+$/, ''),
  supabaseServiceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim(),
  databaseUrl: (process.env.DATABASE_URL ?? 'postgresql://postgres.luyaddknzpiyrhztlage:Rail20Kartik10@aws-0-ap-south-1.pooler.supabase.com:5432/postgres').trim(),
  /** Protects /api/admin/* (RailQuick operations team). Unset = admin routes disabled. */
  adminApiKey: (process.env.ADMIN_API_KEY ?? '').trim(),
  /**
   * Delivery pilot: Delhi stations where RailQuick currently operates (testing phase).
   * Override with DELIVERY_STATIONS=NDLS,NZM,... Confirm this list with operations.
   */
  deliveryStations: (process.env.DELIVERY_STATIONS ?? 'NDLS,NZM,DLI,ANVT,DEE')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean),
  deliveryFeePaise: Number(process.env.DELIVERY_FEE_PAISE ?? 3000),
  freeDeliveryAbovePaise: Number(process.env.FREE_DELIVERY_ABOVE_PAISE ?? 49900),
};

if (!config.sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production.');
  }
  config.sessionSecret = 'dev-only-insecure-secret';
  console.warn('[server] SESSION_SECRET not set: using an insecure dev secret.');
}
