/**
 * Pure date helpers (no DOM / Node APIs) shared by the server and the browser,
 * so the date picker and the API validation enforce exactly the same rules.
 * All "today" logic is in IST (Asia/Kolkata), matching the RailKit docs.
 */

export interface YMD {
  y: number;
  m: number; // 1-12
  d: number;
}

const IST = 'Asia/Kolkata';

/** Today's calendar date in IST. */
export function todayIST(now: Date = new Date()): YMD {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

/** Add whole days to a calendar date (UTC arithmetic avoids DST/zone drift). */
export function addDays(date: YMD, days: number): YMD {
  const t = new Date(Date.UTC(date.y, date.m - 1, date.d + days));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** DD-MM-YYYY, the format every RailKit function expects. */
export function formatDDMMYYYY(date: YMD): string {
  return `${pad(date.d)}-${pad(date.m)}-${date.y}`;
}

/** YYYY-MM-DD, for <input type="date"> style values. */
export function formatISO(date: YMD): string {
  return `${date.y}-${pad(date.m)}-${pad(date.d)}`;
}

/** Parse DD-MM-YYYY into a real calendar date, or null. */
export function parseDDMMYYYY(value: string): YMD | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return null;
  const d = Number(match[1]);
  const m = Number(match[2]);
  const y = Number(match[3]);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return { y, m, d };
}

/** -1, 0, 1 */
export function compareYMD(a: YMD, b: YMD): number {
  return a.y !== b.y ? Math.sign(a.y - b.y) : a.m !== b.m ? Math.sign(a.m - b.m) : Math.sign(a.d - b.d);
}

/** Live tracking window: today back to five days ago (IST). */
export function liveTrackingRange(now: Date = new Date()): { min: YMD; max: YMD } {
  const max = todayIST(now);
  return { min: addDays(max, -5), max };
}

/** Station timetable window: yesterday, today or tomorrow (IST). */
export function timetableRange(now: Date = new Date()): { min: YMD; max: YMD } {
  const today = todayIST(now);
  return { min: addDays(today, -1), max: addDays(today, 1) };
}

export function inRange(date: YMD, range: { min: YMD; max: YMD }): boolean {
  return compareYMD(date, range.min) >= 0 && compareYMD(date, range.max) <= 0;
}
