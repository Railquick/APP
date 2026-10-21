import {
  AssessCode,
  JourneyContext,
  LiveTrackingData,
  PnrResponseData,
} from '../types';

/**
 * Turns a server response into a JourneyContext, but ONLY when the server's own
 * assessment says the journey is eligible. Nothing here invents data: absent
 * fields stay undefined.
 */
export type JourneyBuild =
  | { ok: true; journey: JourneyContext }
  | { ok: false; message: string; code?: AssessCode };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-08-22" -> "22 Aug 2026". Returns the input unchanged if it is not an ISO date. */
export function formatISODate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month} ${m[1]}` : iso;
}

/** "00:07" -> "Late by 7 min"; "00:00" -> "On time"; anything unrecognised is shown as returned. */
export function formatDelay(delay?: string): string | undefined {
  if (!delay) return undefined;
  const m = /^(-?)(\d{1,2}):(\d{2})$/.exec(delay.trim());
  if (!m) return delay;
  const minutes = Number(m[2]) * 60 + Number(m[3]);
  if (minutes === 0) return 'On time';
  const span = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`;
  return m[1] ? `Early by ${span}` : `Late by ${span}`;
}

const NOT_VERIFIED = "We couldn't verify this journey right now. Please try again.";

export function journeyFromPnr(data: PnrResponseData): JourneyBuild {
  const a = data.assessment;
  if (!a) return { ok: false, message: NOT_VERIFIED };
  if (!a.eligible) return { ok: false, message: a.message, code: a.code };
  if (!a.journeyToken || !a.journeyDate || !data.train.number || !data.train.name) {
    return { ok: false, message: NOT_VERIFIED };
  }

  // Coach / seat come only from a verified, non-cancelled passenger record.
  let coach: string | undefined;
  let seat: string | undefined;
  for (const p of data.passengers) {
    const c = p.current ?? p.booking;
    if (!c || (c.status ?? '').toUpperCase().startsWith('CAN')) continue;
    if (c.coach) {
      coach = c.coach;
      seat = c.berthNo !== undefined ? String(c.berthNo) : undefined;
      break;
    }
  }

  return {
    ok: true,
    journey: {
      type: 'pnr',
      pnrData: data,
      trainNumber: data.train.number,
      trainName: data.train.name,
      journeyDate: formatISODate(a.journeyDate),
      journeyDateISO: a.journeyDate,
      journeyStatus: a.journeyStatus,
      journeyToken: a.journeyToken,
      deliveryStations: a.deliveryStations,
      boardingStation: data.journey.boardingPoint?.name ?? data.journey.source?.name,
      destinationStation: data.journey.destination?.name,
      defaultCoach: coach,
      defaultSeat: seat,
      passengerName: data.passengers?.[0]?.serialNumber,
      savedAt: Date.now(),
    },
  };
}

export function journeyFromLive(data: LiveTrackingData): JourneyBuild {
  const a = data.assessment;
  if (!a) return { ok: false, message: NOT_VERIFIED };
  if (!a.eligible) return { ok: false, message: a.message, code: a.code };
  if (!a.journeyToken || !a.journeyDate || !data.trainNo || !data.trainName) {
    return { ok: false, message: NOT_VERIFIED };
  }
  const first = data.timeline[0];
  const last = data.timeline[data.timeline.length - 1];
  return {
    ok: true,
    journey: {
      type: 'live',
      liveData: data,
      trainNumber: data.trainNo,
      trainName: data.trainName,
      journeyDate: formatISODate(a.journeyDate),
      journeyDateISO: a.journeyDate,
      journeyStatus: a.journeyStatus,
      journeyToken: a.journeyToken,
      deliveryStations: a.deliveryStations,
      boardingStation: first?.stationName ?? first?.stationCode,
      destinationStation: last?.stationName ?? last?.stationCode,
      savedAt: Date.now(),
    },
  };
}
