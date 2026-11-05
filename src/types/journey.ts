export interface JourneyDetails {
  pnr: string;
  trainNumber: string;
  trainName: string;
  station: string;
  stationCode: string;
  platform: string;
  coach: string;
  berth: string;
  berthType: string;
  passengerName?: string;
  passengerPhone?: string;
  deliveryMinutes: number;
  haltMinutes: number;
  scheduledArrivalMins: number;
  haltDurationMins: number;
  statusText?: string;
}
