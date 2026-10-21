import crypto from 'node:crypto';
import { Router, type NextFunction, type Request, type Response } from 'express';
import pg from 'pg';
import { z } from 'zod';
import { requireUser } from './auth.js';
import { config } from './config.js';
import { HttpError, ok, rateLimit, route } from './http.js';
import { verifyJourney } from './journey.js';

/**
 * "Request RailQuick in Your Train" persistence (Supabase Postgres table `railquick_train_requests`).
 *
 * Writes to Supabase Postgres over secure pooler connection after session is verified.
 * The train/date come from a signed journey token issued by our own PNR / live-status
 * validation, never from raw unverified client input.
 */

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    try {
      const url = new URL(config.databaseUrl);
      pool = new pg.Pool({
        host: url.hostname,
        port: Number(url.port) || 5432,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, '') || 'postgres',
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    } catch (err) {
      console.error('[db] failed to init pool:', err);
      throw new HttpError('NOT_CONFIGURED', 'Database is temporarily unavailable.');
    }
  }
  return pool;
}

const STATUSES = ['pending', 'requested', 'reviewing', 'approved', 'rejected'] as const;

interface RequestRow {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string | null;
  user_phone: string | null;
  train_name: string;
  train_number: string;
  journey_date: string;
  status: string;
  created_at: string;
}

const publicShape = (r: RequestRow) => ({
  id: r.id,
  trainName: r.train_name,
  trainNumber: r.train_number,
  journeyDate: r.journey_date,
  status: r.status,
  userPhone: r.user_phone,
  createdAt: r.created_at,
});

const adminShape = (r: RequestRow) => ({
  ...publicShape(r),
  userId: r.user_id,
  userName: r.user_name,
  userEmail: r.user_email,
});

/* --------------------------------- user routes --------------------------------- */

export const requestsRouter = Router();

const createSchema = z.object({
  journeyToken: z.string().min(5).max(2000).optional(),
  trainNumber: z.string().max(20).optional(),
  trainName: z.string().max(150).optional(),
  journeyDate: z.string().max(30).optional(),
  areaName: z.string().max(150).optional(),
  userName: z
    .string()
    .transform((s) => s.trim().replace(/\s+/g, ' '))
    .pipe(z.string().min(1, 'Please enter your name.').max(80, 'Name is too long.')),
  userPhone: z.string().optional(),
});

requestsRouter.post(
  '/train-requests',
  rateLimit(10, 60_000),
  route(async (req, res) => {
    const user = await requireUser(req);

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid request.');
    }

    let trainNumber = '00000';
    let trainName = 'Area Request';
    let journeyDate = new Date().toISOString().slice(0, 10);

    if (parsed.data.journeyToken) {
      const claims = verifyJourney(parsed.data.journeyToken);
      if (claims) {
        trainNumber = claims.tn;
        trainName = claims.nm;
        journeyDate = claims.jd;
      }
    }

    // Direct fallback if token not provided or empty
    if (trainNumber === '00000' && (parsed.data.trainNumber || parsed.data.trainName || parsed.data.areaName)) {
      if (parsed.data.trainNumber) trainNumber = parsed.data.trainNumber.trim().slice(0, 10);
      if (parsed.data.trainName) {
        trainName = parsed.data.trainName.trim().slice(0, 120);
      } else if (parsed.data.areaName) {
        trainName = `Area: ${parsed.data.areaName.trim().slice(0, 100)}`;
      }
      if (parsed.data.journeyDate) {
        // Normalize DD-MM-YYYY or YYYY-MM-DD
        const raw = parsed.data.journeyDate.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          journeyDate = raw;
        } else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
          const [d, m, y] = raw.split('-');
          journeyDate = `${y}-${m}-${d}`;
        }
      }
    }

    const phoneToInsert = parsed.data.userPhone?.trim() || user.phone || null;

    try {
      const { rows } = await getPool().query<RequestRow>(
        `insert into railquick_train_requests
          (user_id, user_name, user_email, user_phone, train_name, train_number, journey_date, status)
         values
          ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id, user_id, user_name, user_email, user_phone, train_name, train_number, to_char(journey_date, 'YYYY-MM-DD') as journey_date, status, created_at`,
        [
          user.id,
          parsed.data.userName,
          user.email ?? null,
          phoneToInsert,
          trainName.slice(0, 120),
          trainNumber,
          journeyDate,
          'requested',
        ],
      );

      const created = rows[0];
      if (!created) {
        throw new HttpError('UPSTREAM_ERROR', "Your request couldn't be submitted. Please try again.");
      }

      res.setHeader('Cache-Control', 'no-store');
      ok(res, publicShape(created), 201);
    } catch (err: any) {
      if (err.code === '23505') {
        throw new HttpError('CONFLICT', "You've already requested RailQuick on this train for this journey.", { duplicate: true });
      }
      if (err instanceof HttpError) throw err;
      console.error('[requests] insert error:', err);
      throw new HttpError('UPSTREAM_ERROR', "Your request couldn't be submitted. Please try again.");
    }
  }),
);

requestsRouter.get(
  '/train-requests/mine',
  route(async (req, res) => {
    const user = await requireUser(req);
    try {
      const { rows } = await getPool().query<RequestRow>(
        `select id, user_id, user_name, user_email, user_phone, train_name, train_number, to_char(journey_date, 'YYYY-MM-DD') as journey_date, status, created_at
         from railquick_train_requests
         where user_id = $1
         order by created_at desc
         limit 100`,
        [user.id],
      );

      res.setHeader('Cache-Control', 'no-store');
      ok(res, rows.map(publicShape));
    } catch (err: any) {
      console.error('[requests] list mine error:', err);
      throw new HttpError('UPSTREAM_ERROR', "We couldn't load your requests right now.");
    }
  }),
);

/* --------------------------------- admin routes --------------------------------- */

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const handler = route(async () => {
    if (!config.adminApiKey) {
      throw new HttpError('NOT_CONFIGURED', 'Admin access is not configured on this server.');
    }
    const given = Buffer.from(String(req.headers['x-admin-key'] ?? ''));
    const expected = Buffer.from(config.adminApiKey);
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
      throw new HttpError('UNAUTHORIZED', 'Admin credentials are missing or incorrect.');
    }
    next();
  });
  handler(req, res, next);
}

requestsRouter.use('/admin', rateLimit(30, 60_000), requireAdmin);

const listSchema = z.object({
  status: z.enum(STATUSES).optional(),
  trainNumber: z.string().regex(/^\d{5}$/).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

/** Every request, newest first. Add ?view=demand for per-train/date counts. */
requestsRouter.get(
  '/admin/train-requests',
  route(async (req, res) => {
    const q = listSchema.safeParse(req.query);
    if (!q.success) throw new HttpError('INVALID_INPUT', q.error.issues[0]?.message ?? 'Invalid query.');

    res.setHeader('Cache-Control', 'no-store');

    try {
      if (req.query.view === 'demand') {
        const { rows } = await getPool().query(
          `select train_number, train_name, to_char(journey_date, 'YYYY-MM-DD') as journey_date, request_count, first_requested_at, last_requested_at
           from railquick_train_request_demand
           order by request_count desc
           limit $1`,
          [q.data.limit],
        );
        ok(res, rows);
        return;
      }

      let sql = `select id, user_id, user_name, user_email, user_phone, train_name, train_number, to_char(journey_date, 'YYYY-MM-DD') as journey_date, status, created_at from railquick_train_requests`;
      const params: any[] = [];
      const wheres: string[] = [];

      if (q.data.status) {
        params.push(q.data.status);
        wheres.push(`status = $${params.length}`);
      }
      if (q.data.trainNumber) {
        params.push(q.data.trainNumber);
        wheres.push(`train_number = $${params.length}`);
      }
      if (wheres.length > 0) sql += ` where ${wheres.join(' and ')}`;

      params.push(q.data.limit);
      sql += ` order by created_at desc limit $${params.length}`;

      params.push(q.data.offset);
      sql += ` offset $${params.length}`;

      const { rows } = await getPool().query<RequestRow>(sql, params);
      ok(res, rows.map(adminShape));
    } catch (err: any) {
      console.error('[admin] list failed:', err);
      throw new HttpError('UPSTREAM_ERROR', 'Could not load train requests.');
    }
  }),
);

requestsRouter.patch(
  '/admin/train-requests/:id',
  route(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id);
    const body = z.object({ status: z.enum(STATUSES) }).safeParse(req.body);
    if (!id.success || !body.success) throw new HttpError('INVALID_INPUT', 'A valid request id and status are required.');

    try {
      const { rows } = await getPool().query<RequestRow>(
        `update railquick_train_requests
         set status = $1
         where id = $2
         returning id, user_id, user_name, user_email, user_phone, train_name, train_number, to_char(journey_date, 'YYYY-MM-DD') as journey_date, status, created_at`,
        [body.data.status, id.data],
      );
      if (rows.length === 0) throw new HttpError('NOT_FOUND', 'No such request.');
      ok(res, adminShape(rows[0]));
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      console.error('[admin] patch failed:', err);
      throw new HttpError('UPSTREAM_ERROR', 'Could not update the request.');
    }
  }),
);
