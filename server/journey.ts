import crypto from 'node:crypto';
import { config } from './config.js';
import { YMD, compareYMD, formatISO, todayIST } from '../shared/dates.js';

/**
 * Journey eligibility rules.
 *
 * Only fields that are DOCUMENTED in the RailKit README are read here:
 *  - PNR:  journey.dateOfJourney / arrivalDate ("22 Aug 2026, 04:35:00 pm"),
 *          passengers[].current|booking.status (CNF, RAC, WL, CAN, ...)
 *  - Live: timeline[].status (passed | current | upcoming), statusNote, lastUpdate
 *          ("17-Oct-2026 19:19"), date.
 * Anything else is treated as "unknown" and never guessed.
 */

export type AssessCode =
  | 'OK'
  | 'ENDED'
  | 'NOT_STARTED'
  | 'CANCELLED'
  | 'TICKET_CANCELLED'
  | 'WAITLISTED'
  | 'STALE'
  | 'INCOMPLETE';

export type JourneyStatus = 'upcoming' | 'running' | 'ended' | 'not_started' | 'unknown';

export interface Assessment {
  eligible: boolean;
  code: AssessCode;
  /** Safe, user-facing explanation. Always describes what the API actually returned. */
  message: string;
  journeyStatus: JourneyStatus;
  /** ISO date (YYYY-MM-DD) of the journey, when it could be determined. */
  journeyDate?: string;
  /** Supported RailQuick delivery stations (e.g. NDLS) that lie on this journey. */
  deliveryStations: string[];
  /** Signed proof that this journey passed validation. Only present when eligible. */
  journeyToken?: string;
}

/** A running train whose last NTES update is older than this is not shown as live. */
export const LIVE_STALE_MS = 6 * 60 * 60 * 1000;

/* -------------------------------- date parsing ------------------------------- */

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};
const IST_OFFSET_MS = 330 * 60_000;

export interface ParsedDateTime {
  /** Absolute instant (ms since epoch), interpreting the wall-clock time as IST. */
  epoch: number;
  ymd: YMD;
  hasTime: boolean;
}

function build(y: number, m: number, d: number, hh = 0, mm = 0, ss = 0, hasTime = false): ParsedDateTime | null {
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) return null;
  if (hh > 23 || mm > 59 || ss > 59) return null;
  return { epoch: Date.UTC(y, m - 1, d, hh, mm, ss) - IST_OFFSET_MS, ymd: { y, m, d }, hasTime };
}

/**
 * Parses the date formats RailKit documents:
 *  "22 Aug 2026, 04:35:00 pm", "17-Oct-2026 19:19", "17-Oct-2026", "DD-MM-YYYY", "YYYY-MM-DD".
 * Returns null for anything else (never guesses).
 */
export function parseRailDateTime(value: string | undefined): ParsedDateTime | null {
  if (!value) return null;
  const text = value.trim();

  const named = /^(\d{1,2})[\s-]+([A-Za-z]{3})[A-Za-z]*[\s-]+(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?)?$/.exec(text);
  if (named) {
    const month = MONTHS[named[2].toLowerCase()];
    if (!month) return null;
    let hh = named[4] !== undefined ? Number(named[4]) : 0;
    const mm = named[5] !== undefined ? Number(named[5]) : 0;
    const ss = named[6] !== undefined ? Number(named[6]) : 0;
    const meridiem = named[7]?.toLowerCase();
    if (meridiem) {
      if (hh < 1 || hh > 12) return null;
      hh = (hh % 12) + (meridiem === 'pm' ? 12 : 0);
    }
    return build(Number(named[3]), month, Number(named[1]), hh, mm, ss, named[4] !== undefined);
  }

  const numeric = /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?$/.exec(text);
  if (numeric) {
    return build(Number(numeric[3]), Number(numeric[2]), Number(numeric[1]), Number(numeric[4] ?? 0), Number(numeric[5] ?? 0), 0, numeric[4] !== undefined);
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/.exec(text);
  if (iso) {
    return build(Number(iso[1]), Number(iso[2]), Number(iso[3]), Number(iso[4] ?? 0), Number(iso[5] ?? 0), 0, iso[4] !== undefined);
  }
  return null;
}

/* ----------------------------------- tokens ---------------------------------- */

export interface JourneyClaims {
  /** train number */
  tn: string;
  /** train name */
  nm: string;
  /** ISO journey date */
  jd: string;
  /** how it was validated */
  k: 'pnr' | 'live';
  /** issued-at (ms) */
  iat: number;
}

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const signingKey = () => `${config.sessionSecret}:journey-v1`;

function mac(data: string): string {
  return crypto.createHmac('sha256', signingKey()).update(data).digest('base64url');
}

export function signJourney(claims: Omit<JourneyClaims, 'iat'>, now = Date.now()): string {
  const data = Buffer.from(JSON.stringify({ ...claims, iat: now } satisfies JourneyClaims)).toString('base64url');
  return `${data}.${mac(data)}`;
}

export function verifyJourney(token: unknown, now = Date.now()): JourneyClaims | null {
  if (typeof token !== 'string') return null;
  const [data, signature, extra] = token.split('.');
  if (!data || !signature || extra !== undefined) return null;
  const expected = Buffer.from(mac(data));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const claims = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as Partial<JourneyClaims>;
    if (
      typeof claims.tn !== 'string' || !/^\d{5}$/.test(claims.tn) ||
      typeof claims.nm !== 'string' || !claims.nm.trim() ||
      typeof claims.jd !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(claims.jd) ||
      (claims.k !== 'pnr' && claims.k !== 'live') ||
      typeof claims.iat !== 'number'
    ) {
      return null;
    }
    if (now - claims.iat > TOKEN_TTL_MS || claims.iat > now + 60_000) return null;
    return claims as JourneyClaims;
  } catch {
    return null;
  }
}

/* --------------------------------- helpers ---------------------------------- */

const upper = (v: unknown) => (typeof v === 'string' ? v.trim().toUpperCase() : '');

function supportedAmong(codes: Array<string | undefined>, supported: string[]): string[] {
  const found = new Set<string>();
  for (const c of codes) {
    const code = upper(c);
    if (code && supported.includes(code)) found.add(code);
  }
  return [...found];
}

function reject(
  code: Exclude<AssessCode, 'OK'>,
  message: string,
  journeyStatus: JourneyStatus,
  extra: Partial<Assessment> = {},
): Assessment {
  return { eligible: false, code, message, journeyStatus, deliveryStations: [], ...extra };
}

/* ----------------------------------- PNR ------------------------------------ */

export type SeatClass = 'confirmed' | 'rac' | 'waitlist' | 'cancelled' | 'unknown';

export function classifySeat(status: string | undefined): SeatClass {
  const s = upper(status);
  if (!s) return 'unknown';
  if (s.startsWith('CAN')) return 'cancelled';
  if (s.startsWith('CNF') || s === 'CONFIRMED') return 'confirmed';
  if (s.startsWith('RAC')) return 'rac';
  if (/WL/.test(s)) return 'waitlist';
  return 'unknown';
}

export interface PnrLike {
  train: { number?: string; name?: string };
  journey: {
    dateOfJourney?: string;
    arrivalDate?: string;
    source?: { code?: string };
    destination?: { code?: string };
    boardingPoint?: { code?: string };
  };
  passengers: Array<{ booking?: { status?: string }; current?: { status?: string } }>;
}

export function assessPnr(
  pnr: PnrLike,
  now: Date = new Date(),
  supportedStations: string[] = config.deliveryStations,
): Assessment {
  const depart = parseRailDateTime(pnr.journey.dateOfJourney);
  if (!depart) {
    return reject('INCOMPLETE', "We couldn't read the journey date for this PNR, so we can't confirm the journey is active.", 'unknown');
  }
  const journeyDate = formatISO(depart.ymd);
  const trainNumber = pnr.train.number?.trim();
  const trainName = pnr.train.name?.trim();
  if (!trainNumber || !/^\d{5}$/.test(trainNumber) || !trainName) {
    return reject('INCOMPLETE', 'The train details for this PNR are incomplete, so we cannot continue.', 'unknown', { journeyDate });
  }

  const nowMs = now.getTime();
  const arrive = parseRailDateTime(pnr.journey.arrivalDate);
  if (arrive) {
    if (nowMs > arrive.epoch) {
      return reject('ENDED', 'This journey has already ended.', 'ended', { journeyDate });
    }
  } else if (compareYMD(depart.ymd, todayIST(now)) < 0) {
    return reject(
      'INCOMPLETE',
      "This journey started on an earlier date and the arrival time isn't available, so we can't confirm it's still active.",
      'unknown',
      { journeyDate },
    );
  }

  const classes = pnr.passengers.map((p) => classifySeat(p.current?.status ?? p.booking?.status));
  if (classes.length === 0 || classes.every((c) => c === 'unknown')) {
    return reject('INCOMPLETE', 'Passenger seat details for this PNR are unavailable right now.', 'unknown', { journeyDate });
  }
  if (classes.every((c) => c === 'cancelled')) {
    return reject('TICKET_CANCELLED', 'This ticket has been cancelled.', 'unknown', { journeyDate });
  }
  if (!classes.some((c) => c === 'confirmed' || c === 'rac')) {
    return reject('WAITLISTED', "This ticket isn't confirmed yet (waitlisted), so seat delivery isn't available.", 'unknown', { journeyDate });
  }

  const journeyStatus: JourneyStatus = nowMs < depart.epoch ? 'upcoming' : 'running';
  return {
    eligible: true,
    code: 'OK',
    message: journeyStatus === 'upcoming' ? 'Your journey is confirmed.' : 'Your journey is in progress.',
    journeyStatus,
    journeyDate,
    deliveryStations: supportedAmong(
      [pnr.journey.boardingPoint?.code, pnr.journey.source?.code, pnr.journey.destination?.code],
      supportedStations,
    ),
    journeyToken: signJourney({ tn: trainNumber, nm: trainName, jd: journeyDate, k: 'pnr' }),
  };
}

/* ----------------------------------- Live ----------------------------------- */

export interface TimelineLike {
  type?: string;
  status?: string;
  stationCode?: string;
  stationName?: string;
  arrival?: { scheduled?: string; actual?: string; delay?: string };
  departure?: { scheduled?: string; actual?: string; delay?: string };
}

export interface LiveLike {
  trainNo?: string;
  trainName?: string;
  statusNote?: string;
  lastUpdate?: string;
  timeline: TimelineLike[];
}

export interface LiveSummary {
  currentLocation?: string;
  latestStation?: { code?: string; name?: string };
  delay?: string;
  nextStation?: { code?: string; name?: string; scheduledArrival?: string };
  lastUpdate?: string;
}

const NOT_YET_STARTED = /yet to (start|depart)|not (yet )?(started|departed)|has not started/i;

export function summarizeLive(live: LiveLike): LiveSummary {
  const tl = live.timeline;
  const current = tl.find((t) => t.status === 'current');
  const lastPassed = [...tl].reverse().find((t) => t.status === 'passed');
  const latest = current ?? lastPassed;
  const upcoming = tl.filter((t) => t.status === 'upcoming');
  const next = upcoming.find((t) => t.type === 'stoppage') ?? upcoming[0];
  const delay = latest?.departure?.delay || latest?.arrival?.delay || undefined;
  return {
    currentLocation: live.statusNote,
    latestStation: latest ? { code: latest.stationCode, name: latest.stationName } : undefined,
    delay: delay || undefined,
    nextStation: next
      ? { code: next.stationCode, name: next.stationName, scheduledArrival: next.arrival?.scheduled || undefined }
      : undefined,
    lastUpdate: live.lastUpdate,
  };
}

export function assessLive(
  live: LiveLike,
  requestedDateDDMMYYYY: string,
  now: Date = new Date(),
  supportedStations: string[] = config.deliveryStations,
): Assessment {
  const date = parseRailDateTime(requestedDateDDMMYYYY);
  const journeyDate = date ? formatISO(date.ymd) : undefined;
  const trainNo = live.trainNo?.trim();
  const trainName = live.trainName?.trim();
  if (!date || !trainNo || !/^\d{5}$/.test(trainNo) || !trainName) {
    return reject('INCOMPLETE', 'The railway service returned incomplete train details, so we cannot continue.', 'unknown', { journeyDate });
  }

  const tl = live.timeline;
  const recognised = tl.filter((t) => t.status === 'passed' || t.status === 'current' || t.status === 'upcoming');
  if (recognised.length === 0) {
    return reject('INCOMPLETE', 'Live running information is currently unavailable for this train.', 'unknown', { journeyDate });
  }

  const note = live.statusNote ?? '';
  if (/cancel/i.test(note)) {
    return reject('CANCELLED', 'This train has been cancelled for the selected date.', 'unknown', { journeyDate });
  }

  const hasUpcoming = tl.some((t) => t.status === 'upcoming');
  const movedPastSource = tl.some((t) => t.status === 'passed');
  const atSource = tl[0]?.status === 'current';

  if (!hasUpcoming) {
    return reject('ENDED', 'This journey has already ended.', 'ended', { journeyDate });
  }
  if ((!movedPastSource && !tl.some((t) => t.status === 'current')) || (!movedPastSource && atSource && NOT_YET_STARTED.test(note))) {
    return reject(
      'NOT_STARTED',
      "This train hasn't started its journey yet. Live ordering opens once it is running - if you have a ticket, use the PNR tab.",
      'not_started',
      { journeyDate },
    );
  }

  const updated = parseRailDateTime(live.lastUpdate);
  if (updated && now.getTime() - updated.epoch > LIVE_STALE_MS) {
    return reject(
      'STALE',
      "Live running information is currently unavailable - the latest update is too old to show as live.",
      'unknown',
      { journeyDate },
    );
  }

  const stops = tl.filter((t) => (t.status === 'current' || t.status === 'upcoming') && (t.type === undefined || t.type === 'stoppage'));
  return {
    eligible: true,
    code: 'OK',
    message: 'This train is running.',
    journeyStatus: 'running',
    journeyDate,
    deliveryStations: supportedAmong(stops.map((s) => s.stationCode), supportedStations),
    journeyToken: signJourney({ tn: trainNo, nm: trainName, jd: journeyDate!, k: 'live' }),
  };
}

/** Used when a not-started train also appears on the cancelled list. */
export function markCancelled(a: Assessment): Assessment {
  return reject('CANCELLED', 'This train appears on the cancelled trains list.', 'unknown', { journeyDate: a.journeyDate });
}
