import { Router, type Request } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { config } from './config.js';
import { HttpError, ok, route } from './http.js';
import crypto from 'node:crypto';

export const authRouter = Router();

// Helper to create a signed mock token for session persistence
function createToken(payload: { phone?: string; email?: string; id: string }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.sessionSecret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string) {
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;
  const expected = crypto.createHmac('sha256', config.sessionSecret).update(data).digest('base64url');
  if (signature !== expected) return null;
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

/* ------------------------- request authentication ------------------------- */

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
}

const googleTokenCache = new Map<string, { exp: number; user: AuthUser | null }>();

/** Same id derivation as POST /api/auth/google, so both paths yield one identity per Google account. */
function googleUserId(email: string): string {
  return `usr_g_${crypto.createHash('md5').update(email).digest('hex').slice(0, 10)}`;
}

async function userFromGoogleAccessToken(token: string): Promise<AuthUser | null> {
  const cacheKey = crypto.createHash('sha256').update(token).digest('hex');
  const hit = googleTokenCache.get(cacheKey);
  if (hit && hit.exp > Date.now()) return hit.user;

  let user: AuthUser | null = null;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const info = (await res.json()) as { aud?: string; azp?: string; email?: string; email_verified?: string | boolean };
      const audienceOk = !config.googleClientId || info.aud === config.googleClientId || info.azp === config.googleClientId;
      const verified = info.email_verified === true || info.email_verified === 'true';
      if (audienceOk && verified && typeof info.email === 'string') {
        user = { id: googleUserId(info.email), email: info.email };
      }
    }
  } catch {
    user = null;
  }
  if (googleTokenCache.size > 500) googleTokenCache.clear();
  googleTokenCache.set(cacheKey, { exp: Date.now() + (user ? 5 * 60_000 : 30_000), user });
  return user;
}

/** Resolves the authenticated user from `Authorization: Bearer <token>`, or null. */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? '');
  if (!match) return null;
  const token = match[1];

  const claims = verifyToken(token);
  if (claims && typeof claims.id === 'string' && claims.id) {
    return { id: claims.id, email: claims.email, phone: claims.phone };
  }
  if (config.googleAuthEnabled) return userFromGoogleAccessToken(token);
  return null;
}

export async function requireUser(req: Request): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) throw new HttpError('UNAUTHORIZED', 'Please sign in again to continue.');
  return user;
}

// POST /api/auth/phone
const phoneLoginSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Valid 10-digit Indian phone number required with +91.'),
});

authRouter.post(
  '/auth/phone',
  route(async (req, res) => {
    const { phone } = phoneLoginSchema.parse(req.body);
    const userId = `usr_${crypto.createHash('md5').update(phone).digest('hex').slice(0, 10)}`;
    const token = createToken({ phone, id: userId });

    ok(res, {
      token,
      user: {
        id: userId,
        phone,
      },
    });
  }),
);

// POST /api/auth/google
authRouter.post(
  ['/auth/google', '/google'],
  route(async (req, res) => {
    const { accessToken } = req.body || {};
    if (!accessToken) {
      throw new HttpError('INVALID_INPUT', 'Google access token is required.');
    }

    let email = 'user@railquick.in';
    let name = 'RailQuick Traveler';
    try {
      const gRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (gRes.ok) {
        const profile = (await gRes.json()) as any;
        if (profile.email) email = profile.email;
        if (profile.name) name = profile.name;
      }
    } catch {
      // Fallback to defaults if external request cannot reach google
    }

    const userId = `usr_g_${crypto.createHash('md5').update(email).digest('hex').slice(0, 10)}`;
    const token = createToken({ email, id: userId });

    ok(res, {
      token,
      user: {
        id: userId,
        name,
        email,
      },
    });
  }),
);

// GET /api/serviceability
authRouter.get(
  '/serviceability',
  route(async (req, res) => {
    ok(res, {
      serviceable: true,
      areaTitle: 'New Delhi (NDLS)',
      areaAddress: 'Platform 1-16, Delhi Pilot Hub',
    });
  }),
);

// POST /api/area-requests
authRouter.post(
  '/area-requests',
  route(async (req, res) => {
    const { area, phone } = req.body || {};
    if (!area || !phone) {
      throw new HttpError('INVALID_INPUT', 'Area and phone are required.');
    }

    db.prepare('INSERT INTO area_requests (area, phone) VALUES (?, ?)').run(area, phone);
    ok(res, { success: true, message: 'Area request saved.' });
  }),
);
