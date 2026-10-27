import { env } from '../config/env';
import { Session } from '../types';
import { apiRequest } from './api';

const STORAGE_KEY = 'railquick.session';

/* ------------------------------ session store ----------------------------- */

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed && typeof parsed.token === 'string' && parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/* --------------------------- OAuth Callback Check ------------------------- */

/**
 * Checks if the current page URL contains OAuth return tokens (?token=... or ?access_token=...).
 * If found, saves the session, cleans the query parameters, and returns the Session.
 */
export function checkAuthCallback(): Session | null {
  try {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token') || url.searchParams.get('access_token');
    if (token) {
      const email = url.searchParams.get('email') || undefined;
      const name = url.searchParams.get('name') || undefined;
      const id = url.searchParams.get('user_id') || undefined;

      const session: Session = {
        token,
        user: { email, name, id },
      };
      saveSession(session);

      // Clean OAuth query params from the browser URL
      url.searchParams.delete('token');
      url.searchParams.delete('access_token');
      url.searchParams.delete('email');
      url.searchParams.delete('name');
      url.searchParams.delete('user_id');
      window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));

      return session;
    }
  } catch {
    // Ignore URL parse errors
  }
  return null;
}

/* -------------------------------- validation ------------------------------ */

/** Indian mobile numbers are 10 digits starting with 6-9. */
export function isValidIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value);
}

/* ------------------------------- phone login ------------------------------ */

export async function loginWithPhone(phone: string): Promise<Session> {
  const session = await apiRequest<Session>('/api/auth/phone', {
    method: 'POST',
    body: { phone: `+91${phone}` },
  });
  return assertSession(session);
}

/* ------------------------------ google login ------------------------------ */

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken: () => void;
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: GoogleTokenResponse) => void;
      error_callback?: (error: { type: string }) => void;
    }) => GoogleTokenClient;
  };
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiPromise: Promise<void> | null = null;

/** Loads Google Identity Services client script. */
export function preloadGoogle(): Promise<void> {
  if (!env.googleClientId) return Promise.resolve();
  if (window.google?.accounts) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error('Could not load Google sign-in. Check your connection.'));
      };
      document.head.appendChild(script);
    });
  }
  return gsiPromise;
}

/**
 * Initiates real Google authentication:
 * 1. If VITE_GOOGLE_CLIENT_ID is set, uses Google Identity Services token client popup.
 * 2. If client ID is missing, checks the backend Google OAuth redirect endpoint.
 * 3. Handles loading, cancelled popup, and returns authenticated Session.
 */
export async function loginWithGoogle(): Promise<Session> {
  // If client-side Google Client ID is configured, use Google Identity Services popup
  if (env.googleClientId) {
    await preloadGoogle();
    const google = window.google;
    if (!google) throw new Error('Google sign-in is unavailable right now. Please check your network connection.');

    const accessToken = await new Promise<string>((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: env.googleClientId,
        scope: 'openid email profile',
        callback: (response) => {
          if (response.error) {
            reject(new Error(`Google sign-in error: ${response.error}`));
          } else if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Google sign-in failed. No access token received.'));
          }
        },
        error_callback: (error) => {
          reject(new Error(error.type === 'popup_closed' ? 'Google sign-in was cancelled.' : 'Google sign-in failed.'));
        },
      });
      client.requestAccessToken();
    });

    const rawSession = await apiRequest<any>('/api/v1/auth/google', {
      method: 'POST',
      body: { accessToken },
    });
    const session: Session = {
      token: rawSession?.token || rawSession?.access_token,
      user: rawSession?.user,
    };
    const validSession = assertSession(session);
    saveSession(validSession);
    return validSession;
  }

  // Check backend Google OAuth redirect endpoint
  try {
    const check = await fetch('/api/v1/auth/google/login', { method: 'GET', redirect: 'manual' });
    if (check.status === 302 || check.status === 307 || check.type === 'opaqueredirect') {
      window.location.href = '/api/v1/auth/google/login';
      return new Promise(() => {}); // Wait for browser redirect
    }
    const errData = await check.json().catch(() => null);
    if (errData?.detail) {
      throw new Error(errData.detail);
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  throw new Error('Google OAuth is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in .env.local.');
}

function assertSession(session: Session | null): Session {
  if (!session || typeof session.token !== 'string' || !session.token) {
    throw new Error('Unexpected response from server. Please try again.');
  }
  return session;
}


