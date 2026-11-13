import { JourneyDetails } from '../types/journey';

export interface PnrDemoRecord {
  pnr: string;
  trainNumber: string;
  trainName: string;
  station: string;
  stationCode: string;
  platform: string;
  coach: string;
  berth: string;
  berthType: string;
  deliveryMinutes: number;
  haltMinutes: number;
  scheduledArrivalMins: number;
  haltDurationMins: number;
  statusText: string;
  passengerName: string;
  isLive: boolean; // true = delivers to berth now, false = coming soon
  arrivalTime?: string;
}

export const DEMO_PNR_RECORDS: PnrDemoRecord[] = [
  {
    pnr: '2458-9102-36',
    trainNumber: '12424',
    trainName: '12424 • DBRT Rajdhani Express',
    station: 'Hazrat Nizamuddin (NZM)',
    stationCode: 'NZM',
    platform: 'PF 1',
    coach: 'B2',
    berth: '36',
    berthType: 'Lower Berth (Window)',
    deliveryMinutes: 5,
    haltMinutes: 5,
    scheduledArrivalMins: 14,
    haltDurationMins: 5,
    statusText: 'CONFIRMED BERTH',
    passengerName: 'Varun Sharma',
    isLive: true,
    arrivalTime: '16:30',
  },
  {
    pnr: '4821-7739-12',
    trainNumber: '12345',
    trainName: '12345 • Saraighat Express',
    station: 'Kanpur Central (CNB)',
    stationCode: 'CNB',
    platform: 'PF 2',
    coach: 'B2',
    berth: '36',
    berthType: 'Lower Berth (LB)',
    deliveryMinutes: 5,
    haltMinutes: 10,
    scheduledArrivalMins: 14,
    haltDurationMins: 10,
    statusText: 'CONFIRMED BERTH',
    passengerName: 'Gaurav Mehta',
    isLive: false,
  },
  {
    pnr: '6510-9284-55',
    trainNumber: '12004',
    trainName: '12004 • Lucknow Swarna Shatabdi',
    station: 'New Delhi (NDLS)',
    stationCode: 'NDLS',
    platform: 'PF 14',
    coach: 'C4',
    berth: '18',
    berthType: 'Window Seat (WS)',
    deliveryMinutes: 5,
    haltMinutes: 15,
    scheduledArrivalMins: 22,
    haltDurationMins: 15,
    statusText: 'CONFIRMED BERTH',
    passengerName: 'Priya Iyer',
    isLive: false,
  },
  {
    pnr: '8392-1048-27',
    trainNumber: '20172',
    trainName: '20172 • Vande Bharat Express',
    station: 'Bhopal Jn (BPL)',
    stationCode: 'BPL',
    platform: 'PF 3',
    coach: 'C2',
    berth: '42',
    berthType: 'Aisle Seat (AS)',
    deliveryMinutes: 5,
    haltMinutes: 8,
    scheduledArrivalMins: 18,
    haltDurationMins: 8,
    statusText: 'CONFIRMED BERTH',
    passengerName: 'Amit Verma',
    isLive: false,
  },
];

/**
 * Checks if a given station code or station name is active for RailQuick 5-min delivery.
 * Currently, ONLY Hazrat Nizamuddin (NZM) is active.
 */
export function isStationServiceable(stationCodeOrName: string): boolean {
  if (!stationCodeOrName) return false;
  const upper = stationCodeOrName.toUpperCase();
  return (
    upper === 'NZM' ||
    upper.includes('NIZAMUDDIN') ||
    upper.includes('HAZRAT NIZAMUDDIN') ||
    upper.includes('(NZM)')
  );
}

/**
 * Look up PNR details. Returns matching record from demo database or synthesizes one.
 */
export function lookupPnrDetails(inputPnr: string, preferredStation?: string): PnrDemoRecord {
  const cleanInput = inputPnr.replace(/[\s-]/g, '');

  const match = DEMO_PNR_RECORDS.find(
    (r) => r.pnr.replace(/[\s-]/g, '') === cleanInput
  );
  if (match) {
    return match;
  }

  // If a preferred station was given (e.g. from user selector)
  if (preferredStation) {
    const isNZM = isStationServiceable(preferredStation);
    return {
      pnr: inputPnr,
      trainNumber: '12424',
      trainName: '12424 • Rajdhani Express',
      station: preferredStation,
      stationCode: isNZM ? 'NZM' : 'OTHER',
      platform: 'PF 1',
      coach: 'B2',
      berth: '36',
      berthType: 'Lower Berth (LB)',
      deliveryMinutes: 5,
      haltMinutes: 5,
      scheduledArrivalMins: 14,
      haltDurationMins: 5,
      statusText: 'CONFIRMED BERTH',
      passengerName: 'Passenger',
      isLive: isNZM,
    };
  }

  // Fallback default: if user typed something custom, default to NZM or non-NZM
  const isNZM = cleanInput.endsWith('1') || cleanInput.startsWith('2458');
  return {
    pnr: inputPnr,
    trainNumber: '12424',
    trainName: '12424 • Rajdhani Express',
    station: isNZM ? 'Hazrat Nizamuddin (NZM)' : 'Kanpur Central (CNB)',
    stationCode: isNZM ? 'NZM' : 'CNB',
    platform: isNZM ? 'PF 1' : 'PF 2',
    coach: 'B2',
    berth: '36',
    berthType: 'Lower Berth (LB)',
    deliveryMinutes: 5,
    haltMinutes: 5,
    scheduledArrivalMins: 14,
    haltDurationMins: 5,
    statusText: 'CONFIRMED BERTH',
    passengerName: 'Passenger',
    isLive: isNZM,
  };
}

