export interface JourneyDetails {
  pnr: string;
  trainNumber: string;
  trainName: string;
  station: string;
  platform: string;
  coach: string;
  berth: string;
  berthType: string;
  deliveryMinutes: number;
  haltMinutes: number;
  scheduledArrivalMins: number;
  haltDurationMins: number;
  statusText?: string;
}

