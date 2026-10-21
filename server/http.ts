import type { NextFunction, Request, Response } from 'express';

export type ErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'AUTH_FAILED'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'NOT_CONFIGURED'
  | 'UPSTREAM_ERROR'
  | 'UNEXPECTED_RESPONSE'
  | 'UNAUTHORIZED'
  | 'CONFLICT'
  | 'UNSUPPORTED_DELIVERY'
  | 'INTERNAL';

const STATUS: Record<ErrorCode, number> = {
  INVALID_INPUT: 400,
  NOT_FOUND: 404,
  AUTH_FAILED: 502, // our credentials to RailKit failed: not the user's fault
  RATE_LIMITED: 429,
  TIMEOUT: 504,
  NOT_CONFIGURED: 503,
  UPSTREAM_ERROR: 502,
  UNEXPECTED_RESPONSE: 502,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  UNSUPPORTED_DELIVERY: 422,
  INTERNAL: 500,
};

export class HttpError extends Error {
  constructor(public code: ErrorCode, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

export function ok(res: Response, data: unknown, status = 200) {
  res.status(status).json({ ok: true, data });
}

export function fail(res: Response, error: HttpError) {
  res.status(STATUS[error.code]).json({ ok: false, code: error.code, message: error.message, ...error.extra });
}

/** Wrap async handlers so thrown HttpErrors become structured JSON, never stack traces. */
export const route =
  (handler: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, _next: NextFunction) => {
    handler(req, res).catch((err: unknown) => {
      if (err instanceof HttpError) return fail(res, err);
      console.error('[server] unhandled', err instanceof Error ? err.message : err);
      fail(res, new HttpError('INTERNAL', 'Something went wrong on our side. Please try again.'));
    });
  };

/** Tiny in-memory fixed-window limiter (per IP). Protects our upstream quota from abuse. */
export function rateLimit(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
      return fail(res, new HttpError('RATE_LIMITED', 'Too many requests. Please wait a moment and try again.'));
    }
    next();
  };
}
