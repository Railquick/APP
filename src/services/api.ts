import { env } from '../config/env';

export class NotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotConfiguredError';
  }
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

/**
 * Universal apiRequest supporting both proxy relative URLs and absolute VITE_API_BASE_URL.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const rawBase = (env.apiBaseUrl || '').replace(/\/+$/, '');
  const base = rawBase.replace(/\/api$/, '');

  // Ensure route starts with /
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Ensure route starts with /api without double-prepending
  if (!normalizedPath.startsWith('/api')) {
    normalizedPath = `/api${normalizedPath}`;
  }
  normalizedPath = normalizedPath.replace(/^\/api\/api(?=\/|$)/, '/api');

  let fullUrl = base ? `${base}${normalizedPath}` : normalizedPath;
  fullUrl = fullUrl.replace(/\/api\/api(?=\/|$)/, '/api');

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Network error. Check your connection and try again.');
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const code = data?.code;
    const message =
      typeof data?.message === 'string'
        ? data.message
        : `Something went wrong (${response.status}). Please try again.`;

    if (code === 'NOT_CONFIGURED') {
      throw new NotConfiguredError(message);
    }
    throw new ApiError(message, response.status, code);
  }

  // If server returns wrapped { ok: true, data: T }
  if (data && typeof data === 'object' && 'ok' in data && 'data' in data) {
    return data.data as T;
  }

  return data as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof NotConfiguredError) return error.message;
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
