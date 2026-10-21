import { Router } from 'express';
import { z } from 'zod';
import {
  cancelList,
  checkPNRStatus,
  configure,
  getTrainHistory,
  getTrainInfo,
  liveAtStation,
  searchTrainBetweenStations,
  stationsByName,
  trackTrain,
  trainByNumber,
  trainsByName,
  trainTimetableAtStation,
} from 'railkit';
import { config } from './config.js';
import { ErrorCode, HttpError, ok, rateLimit, route } from './http.js';
import { assessLive, assessPnr, markCancelled, summarizeLive } from './journey.js';
import {
  compareYMD,
  formatDDMMYYYY,
  inRange,
  liveTrackingRange,
  parseDDMMYYYY,
  timetableRange,
  todayIST,
} from '../shared/dates.js';

/* ------------------------------ SDK plumbing ------------------------------ */

let configured = false;
/** Configure the SDK once per server runtime from the secret env var. */
function ensureConfigured() {
  if (!config.railkitApiKey) {
    throw new HttpError(
      'NOT_CONFIGURED',
      'Railway data is not configured on the server yet (RAILKIT_API_KEY is missing).',
    );
  }
  if (!configured) {
    configure(config.railkitApiKey);
    configured = true;
  }
}

interface SdkResult {
  success?: boolean;
  data?: unknown;
  error?: unknown;
  statusCode?: number;
}

/**
 * Run an SDK call with a timeout and translate every failure mode into a typed
 * HttpError. The SDK reports failures as `{ success:false, error:string, statusCode? }`
 * (README "Error Handling"), so we classify on statusCode first, then on the
 * documented error strings. Upstream text is never forwarded to the browser.
 */
async function sdk(call: () => Promise<unknown>, notFound: { code: ErrorCode; message: string }): Promise<unknown> {
  ensureConfigured();
  let timer: NodeJS.Timeout | undefined;
  let result: SdkResult;
  try {
    result = (await Promise.race([
      call(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('__timeout__')), config.upstreamTimeoutMs);
      }),
    ])) as SdkResult;
  } catch (err) {
    if (err instanceof Error && err.message === '__timeout__') {
      throw new HttpError('TIMEOUT', 'The railway service took too long to respond. Please try again.');
    }
    throw new HttpError('UPSTREAM_ERROR', 'Could not reach the railway service. Please try again shortly.');
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (!result || typeof result !== 'object' || typeof result.success !== 'boolean') {
    throw new HttpError('UNEXPECTED_RESPONSE', 'The railway service returned an unexpected response.');
  }
  if (result.success) return result.data;

  const text = typeof result.error === 'string' ? result.error : '';
  const status = result.statusCode;
  console.warn('[railkit] failure', status ?? '', text.slice(0, 120));

  if (status === 401 || status === 403 || /invalid api key|api key is inactive/i.test(text)) {
    throw new HttpError('AUTH_FAILED', 'Railway data is temporarily unavailable (service authentication problem).');
  }
  if (status === 429 || /usage limit|rate limit/i.test(text)) {
    throw new HttpError('RATE_LIMITED', 'The railway data service is busy right now. Please try again in a few minutes.');
  }
  if (/timed out|timeout/i.test(text) || status === 504) {
    throw new HttpError('TIMEOUT', 'The railway service took too long to respond. Please try again.');
  }
  if (/not configured/i.test(text)) {
    throw new HttpError('NOT_CONFIGURED', 'Railway data is not configured on the server yet.');
  }
  if (status === 404 || /not found|no such|invalid pnr|flushed|no record|no data/i.test(text)) {
    throw new HttpError(notFound.code, notFound.message);
  }
  if (status === 400 || /must be|invalid .*(format|number|station|date)/i.test(text)) {
    throw new HttpError('INVALID_INPUT', 'The railway service rejected that input. Please check it and try again.');
  }
  throw new HttpError('UPSTREAM_ERROR', 'The railway service had a problem. Please try again shortly.');
}

/* ------------------------------ safe accessors ----------------------------- */

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' && Number.isFinite(v) ? String(v) : undefined;
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const station = (v: unknown) => (isRec(v) ? { code: str(v.code), name: str(v.name) } : undefined);

function status(v: unknown) {
  if (!isRec(v)) return undefined;
  return {
    status: str(v.status),
    coach: str(v.coach),
    berthNo: num(v.berthNo),
    berthCode: str(v.berthCode),
    details: str(v.details),
  };
}

function timing(v: unknown) {
  if (!isRec(v)) return undefined;
  return { scheduled: str(v.scheduled), actual: str(v.actual), delay: str(v.delay) };
}

/* ------------------------------- normalizers ------------------------------- */

function normalizePnr(raw: unknown) {
  if (!isRec(raw) || !isRec(raw.train) || !isRec(raw.journey)) {
    throw new HttpError('UNEXPECTED_RESPONSE', 'The railway service returned PNR data we could not read.');
  }
  const trainNumber = str(raw.train.number);
  const trainName = str(raw.train.name);
  if (!trainNumber && !trainName) {
    throw new HttpError('NOT_FOUND', 'No journey details were found for this PNR.');
  }
  const j = raw.journey;
  const b = isRec(raw.booking) ? raw.booking : {};
  return {
    pnr: str(raw.pnr),
    train: { number: trainNumber, name: trainName },
    journey: {
      dateOfJourney: str(j.dateOfJourney),
      class: str(j.class),
      quota: str(j.quota),
      source: station(j.source),
      destination: station(j.destination),
      boardingPoint: station(j.boardingPoint),
      distance: num(j.distance),
      arrivalDate: str(j.arrivalDate),
    },
    chartStatus: isRec(raw.chart) ? str(raw.chart.status) : undefined,
    booking: { fare: num(b.fare), ticketFare: num(b.ticketFare), bookingDate: str(b.bookingDate) },
    passengers: arr(raw.passengers)
      .filter(isRec)
      .map((p) => ({
        serialNumber: str(p.serialNumber),
        booking: status(p.booking),
        current: status(p.current),
      })),
  };
}

function normalizeLive(raw: unknown) {
  if (!isRec(raw) || !Array.isArray(raw.timeline)) {
    throw new HttpError('UNEXPECTED_RESPONSE', 'The railway service returned live status we could not read.');
  }
  const p = isRec(raw.progress) ? raw.progress : undefined;
  return {
    trainNo: str(raw.trainNo),
    trainName: str(raw.trainName),
    date: str(raw.date),
    statusNote: str(raw.statusNote),
    lastUpdate: str(raw.lastUpdate),
    currentStationCode: str(raw.currentStationCode),
    totalStations: num(raw.totalStations),
    totalDistanceKm: num(raw.totalDistanceKm),
    progress: p
      ? {
          journeyStatus: str(p.journeyStatus),
          passedStations: num(p.passedStations),
          remainingStations: num(p.remainingStations),
          distanceRemainingKm: num(p.distanceRemainingKm),
          percent: num(p.percent),
        }
      : undefined,
    timeline: raw.timeline.filter(isRec).map((t) => ({
      type: str(t.type),
      status: str(t.status),
      stationCode: str(t.stationCode),
      stationName: str(t.stationName),
      platform: str(t.platform),
      distanceKm: str(t.distanceKm),
      arrival: timing(t.arrival),
      departure: timing(t.departure),
    })),
  };
}

function normalizeHistory(raw: unknown) {
  if (!isRec(raw) || !Array.isArray(raw.stations)) {
    throw new HttpError('UNEXPECTED_RESPONSE', 'The railway service returned journey history we could not read.');
  }
  return {
    trainNo: str(raw.trainNo),
    trainName: str(raw.trainName),
    journeyDate: str(raw.journeyDate),
    sourceStationName: str(raw.sourceStationName),
    destinationStationName: str(raw.destinationStationName),
    lastUpdate: str(raw.lastUpdate),
    stations: raw.stations.filter(isRec).map((s) => ({
      stationCode: str(s.stationCode),
      stationName: str(s.stationName),
      platform: str(s.platform),
      arrival: timing(s.arrival),
      departure: timing(s.departure),
    })),
  };
}

function normalizeTrainInfo(raw: unknown) {
  if (!isRec(raw) || !isRec(raw.trainInfo)) {
    throw new HttpError('UNEXPECTED_RESPONSE', 'The railway service returned train information we could not read.');
  }
  const t = raw.trainInfo;
  return {
    trainNo: str(t.train_no),
    trainName: str(t.train_name),
    fromName: str(t.from_stn_name),
    fromCode: str(t.from_stn_code),
    toName: str(t.to_stn_name),
    toCode: str(t.to_stn_code),
    fromTime: str(t.from_time),
    toTime: str(t.to_time),
    travelTime: str(t.travel_time),
    runningDays: str(t.running_days),
    type: str(t.type),
    route: arr(raw.route)
      .filter(isRec)
      .map((s) => ({
        stationCode: str(s.stnCode),
        stationName: str(s.stnName),
        arrival: str(s.arrival),
        departure: str(s.departure),
        halt: str(s.halt),
        distance: str(s.distance),
        day: str(s.day),
      })),
  };
}

/* --------------------------------- schemas --------------------------------- */

const pnrSchema = z.object({ pnr: z.string().regex(/^\d{10}$/, 'PNR must be exactly 10 digits.') });
const trainNo = z.string().regex(/^\d{5}$/, 'Train number must be exactly 5 digits.');
const stationCode = z
  .string()
  .transform((s) => s.trim().toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{1,5}$/, 'Station code must be 1-5 letters.'));
const dateStr = z.string().refine((s) => parseDDMMYYYY(s) !== null, 'Date must be a real date in DD-MM-YYYY format.');

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError('INVALID_INPUT', result.error.issues[0]?.message ?? 'Invalid input.');
  }
  return result.data;
}

const MSG = {
  train: { code: 'NOT_FOUND', message: 'No train was found for that number.' } as const,
  generic: { code: 'NOT_FOUND', message: 'No data was found for that request.' } as const,
};

/* ---------------------- caching (non-sensitive data only) ---------------------- */

const cacheStore = new Map<string, { exp: number; value: unknown }>();
const CACHE_MAX_ENTRIES = 500;

/** Server-side memo for public train/station data. NEVER used for PNR or live status. */
async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = cacheStore.get(key);
  if (hit && hit.exp > now) return hit.value as T;
  const value = await load();
  if (cacheStore.size >= CACHE_MAX_ENTRIES) cacheStore.delete(cacheStore.keys().next().value as string);
  cacheStore.set(key, { exp: now + ttlMs, value });
  return value;
}

const PUBLIC_TTL_S = 300;

/* -------------------------------- cancelled list ------------------------------- */

/**
 * The cancel-list response shape is not documented, so we only look for a train
 * number under keys that obviously denote one (trainNo / train_no / trainNumber / number).
 */
function listsTrain(data: unknown, wanted: string, depth = 0): boolean {
  if (depth > 6) return false;
  if (Array.isArray(data)) return data.some((x) => listsTrain(x, wanted, depth + 1));
  if (!isRec(data)) return false;
  return Object.entries(data).some(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const isTrainKey = /^number$/i.test(key) || (/train/i.test(key) && /(no|num)/i.test(key));
      return isTrainKey && String(value).trim() === wanted;
    }
    return listsTrain(value, wanted, depth + 1);
  });
}

/* ---------------------------------- routes --------------------------------- */

export const railwayRouter = Router();
railwayRouter.use(rateLimit(60, 60_000));

/** PNR lookups are personal and costly: tighter limit, never cached anywhere. */
const pnrLimiter = rateLimit(12, 60_000);

railwayRouter.post(
  '/pnr',
  pnrLimiter,
  route(async (req, res) => {
    const { pnr } = parse(pnrSchema, req.body);
    const data = await sdk(() => checkPNRStatus(pnr), {
      code: 'NOT_FOUND',
      message: "We couldn't verify this PNR. Please check the number and try again.",
    });
    const normalized = normalizePnr(data);
    res.setHeader('Cache-Control', 'no-store');
    ok(res, { ...normalized, assessment: assessPnr(normalized) });
  }),
);

railwayRouter.get(
  '/train-info',
  route(async (req, res) => {
    const n = parse(trainNo, req.query.trainNumber);
    const info = await cached(`info:${n}`, 10 * 60_000, async () => normalizeTrainInfo(await sdk(() => getTrainInfo(n), MSG.train)));
    res.setHeader('Cache-Control', `public, max-age=${PUBLIC_TTL_S}`);
    ok(res, info);
  }),
);

/** Search by name (>=2 chars) or by number prefix (2-5 digits). */
railwayRouter.get(
  '/train-search',
  route(async (req, res) => {
    const q = parse(z.string().trim().min(2, 'Type at least 2 characters.').max(40), req.query.q);
    const byNumber = /^\d+$/.test(q);
    if (byNumber && q.length > 5) throw new HttpError('INVALID_INPUT', 'Train numbers have at most 5 digits.');
    const result = await cached(`search:${q.toLowerCase()}`, 10 * 60_000, async () => {
      const data = await sdk(() => (byNumber ? trainByNumber(q) : trainsByName(q)), MSG.generic).catch((e) => {
        // A search with no matches is an empty list, not an error.
        if (e instanceof HttpError && e.code === 'NOT_FOUND') return { trains: [] };
        throw e;
      });
      const trains = isRec(data) ? arr(data.trains) : [];
      return {
        trains: trains
          .filter(isRec)
          .map((t) => ({ trainNo: str(t.trainNo), trainName: str(t.trainName) }))
          .filter((t) => t.trainNo),
      };
    });
    res.setHeader('Cache-Control', `public, max-age=${PUBLIC_TTL_S}`);
    ok(res, result);
  }),
);

railwayRouter.get(
  '/train-live',
  route(async (req, res) => {
    const n = parse(trainNo, req.query.trainNumber);
    const date = parse(dateStr, req.query.date);
    const range = liveTrackingRange();
    if (!inRange(parseDDMMYYYY(date)!, range)) {
      throw new HttpError(
        'INVALID_INPUT',
        `Live status is available from ${formatDDMMYYYY(range.min)} to ${formatDDMMYYYY(range.max)} (IST).`,
      );
    }
    const live = normalizeLive(
      await sdk(() => trackTrain(n, date), {
        code: 'NOT_FOUND',
        message: 'No live running data was found for this train on the selected date. The train may not run on that day.',
      }),
    );

    let assessment = assessLive(live, date);
    if (assessment.code === 'NOT_STARTED') {
      // Distinguish "hasn't started" from "cancelled". If the cancel list is
      // unavailable we keep the NOT_STARTED verdict rather than guess.
      try {
        if (listsTrain(await sdk(() => cancelList(), MSG.generic), n)) assessment = markCancelled(assessment);
      } catch {
        /* cancel list unavailable: do not infer anything from the outage */
      }
    }

    res.setHeader('Cache-Control', 'no-store');
    ok(res, { ...live, summary: summarizeLive(live), assessment });
  }),
);

/** Cancelled trains. With ?trainNumber=NNNNN answers "is it listed"; otherwise returns the list. */
railwayRouter.get(
  '/cancelled',
  route(async (req, res) => {
    const wanted = req.query.trainNumber === undefined ? undefined : parse(trainNo, req.query.trainNumber);
    const data = await cached('cancel-list', 5 * 60_000, () => sdk(() => cancelList(), MSG.generic));
    if (!isRec(data) && !Array.isArray(data)) {
      throw new HttpError('UNEXPECTED_RESPONSE', 'The railway service returned an unreadable cancelled-trains list.');
    }
    res.setHeader('Cache-Control', 'public, max-age=120');
    ok(res, wanted ? { trainNumber: wanted, listed: listsTrain(data, wanted) } : data);
  }),
);

/** Completed-journey history; only meaningful for past dates. */
railwayRouter.get(
  '/train-history',
  route(async (req, res) => {
    const n = parse(trainNo, req.query.trainNumber);
    const date = parse(dateStr, req.query.date);
    if (compareYMD(parseDDMMYYYY(date)!, todayIST()) >= 0) {
      throw new HttpError('INVALID_INPUT', 'Journey history is only available for completed (past) journeys.');
    }
    ok(
      res,
      normalizeHistory(
        await sdk(() => getTrainHistory(n, date), {
          code: 'NOT_FOUND',
          message: 'No completed-journey record exists for that train and date yet.',
        }),
      ),
    );
  }),
);

railwayRouter.get(
  '/stations',
  route(async (req, res) => {
    const q = parse(z.string().trim().min(2, 'Type at least 2 characters.').max(40), req.query.q);
    const data = await sdk(() => stationsByName(q), MSG.generic).catch((e) => {
      if (e instanceof HttpError && e.code === 'NOT_FOUND') return { stations: [] };
      throw e;
    });
    const stations = isRec(data) ? arr(data.stations) : [];
    ok(res, {
      stations: stations
        .filter(isRec)
        .map((s) => ({ code: str(s.code), name: str(s.name) }))
        .filter((s) => s.code),
    });
  }),
);

railwayRouter.get(
  '/station-live',
  route(async (req, res) => {
    const code = parse(stationCode, req.query.stationCode);
    const hrs = parse(z.coerce.number().refine((n) => [2, 4, 8].includes(n), 'Hours must be 2, 4 or 8.'), req.query.hrs ?? 2);
    const data = await sdk(() => liveAtStation(code, hrs as 2 | 4 | 8), MSG.generic);
    if (!isRec(data)) throw new HttpError('UNEXPECTED_RESPONSE', 'The railway service returned an unreadable station board.');
    ok(res, {
      summary: str(data.summary),
      trains: arr(data.trains)
        .filter(isRec)
        .map((t) => ({
          trainNo: str(t.trainNo),
          trainName: str(t.trainName),
          sourceName: str(t.sourceName),
          destName: str(t.destName),
          platform: str(t.platform),
          cancelled: t.cancelled === true,
          arrival: isRec(t.arrival) ? { scheduled: str(t.arrival.scheduled), actual: str(t.arrival.actual), delay: num(t.arrival.delay) } : undefined,
          departure: isRec(t.departure) ? { scheduled: str(t.departure.scheduled), actual: str(t.departure.actual), delay: num(t.departure.delay) } : undefined,
        })),
    });
  }),
);

railwayRouter.get(
  '/station-timetable',
  route(async (req, res) => {
    const code = parse(stationCode, req.query.stationCode);
    const dateRaw = req.query.date;
    let date: string | undefined;
    if (dateRaw !== undefined && dateRaw !== '') {
      date = parse(dateStr, dateRaw);
      const range = timetableRange();
      if (!inRange(parseDDMMYYYY(date)!, range)) {
        throw new HttpError('INVALID_INPUT', 'Timetable is available for yesterday, today or tomorrow only.');
      }
    }
    const data = await sdk(() => trainTimetableAtStation(code, date), MSG.generic);
    // The timetable response shape is not documented in the README, so it is
    // passed through as JSON-safe data after confirming it is an object/array.
    if (!isRec(data) && !Array.isArray(data)) {
      throw new HttpError('UNEXPECTED_RESPONSE', 'The railway service returned an unreadable timetable.');
    }
    ok(res, data);
  }),
);

railwayRouter.get(
  '/trains-between',
  route(async (req, res) => {
    const from = parse(stationCode, req.query.from);
    const to = parse(stationCode, req.query.to);
    const date = req.query.date ? parse(dateStr, req.query.date) : undefined;
    const data = await sdk(() => searchTrainBetweenStations(from, to, date), MSG.generic);
    ok(
      res,
      arr(data)
        .filter(isRec)
        .map((t) => ({
          trainNo: str(t.train_no),
          trainName: str(t.train_name),
          fromName: str(t.from_stn_name),
          toName: str(t.to_stn_name),
          fromTime: str(t.from_time),
          toTime: str(t.to_time),
          travelTime: str(t.travel_time),
        })),
    );
  }),
);

/** Re-verify a PNR server-side (used by checkout) without trusting the browser's copy. */
export async function verifyPnr(pnr: string) {
  const data = await sdk(() => checkPNRStatus(pnr), {
    code: 'NOT_FOUND',
    message: 'This PNR could not be verified.',
  });
  return normalizePnr(data);
}
