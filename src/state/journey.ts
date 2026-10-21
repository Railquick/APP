import { useEffect, useState } from 'react';
import { JourneyContext } from '../types';

const JOURNEY_KEY = 'railquick.current_journey';
const EVENT_NAME = 'railquick:journey_change';

/** Journeys are re-validated after this long (server tokens last 24h). */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function getStoredJourney(): JourneyContext | null {
  try {
    const raw = sessionStorage.getItem(JOURNEY_KEY) || localStorage.getItem(JOURNEY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<JourneyContext>;
    if (
      !parsed ||
      typeof parsed.journeyToken !== 'string' ||
      !parsed.journeyToken ||
      typeof parsed.savedAt !== 'number' ||
      Date.now() - parsed.savedAt > MAX_AGE_MS
    ) {
      return null;
    }
    return parsed as JourneyContext;
  } catch {
    return null;
  }
}

export function saveJourney(journey: JourneyContext): void {
  try {
    const val = JSON.stringify(journey);
    sessionStorage.setItem(JOURNEY_KEY, val);
    localStorage.setItem(JOURNEY_KEY, val);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: journey }));
  } catch (err) {
    console.warn('Failed to save journey state', err);
  }
}

export function clearJourney(): void {
  sessionStorage.removeItem(JOURNEY_KEY);
  localStorage.removeItem(JOURNEY_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }));
}

export function useJourney(): JourneyContext | null {
  const [journey, setJourney] = useState<JourneyContext | null>(() => getStoredJourney());

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const custom = e as CustomEvent<JourneyContext | null>;
      setJourney(custom.detail);
    };
    window.addEventListener(EVENT_NAME, onUpdate);
    return () => window.removeEventListener(EVENT_NAME, onUpdate);
  }, []);

  return journey;
}
