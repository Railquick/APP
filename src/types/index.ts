export interface Session {
  token: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface ServiceabilityStatus {
  serviceable: boolean;
  areaTitle: string;
  areaAddress: string;
}

export interface AreaRequestPayload {
  area: string;
  phone: string;
}

/* ----------------------------- Railway Types ----------------------------- */

export interface StationRef {
  code?: string;
  name?: string;
}

export interface PassengerBookingInfo {
  status?: string;
  coach?: string;
  berthNo?: number;
  berthCode?: string;
  details?: string;
}

export interface PnrPassenger {
  serialNumber?: string;
  booking?: PassengerBookingInfo;
  current?: PassengerBookingInfo;
}

export interface PnrResponseData {
  pnr?: string;
  train: {
    number?: string;
    name?: string;
  };
  journey: {
    dateOfJourney?: string;
    class?: string;
    quota?: string;
    source?: StationRef;
    destination?: StationRef;
    boardingPoint?: StationRef;
    distance?: number;
    arrivalDate?: string;
  };
  chartStatus?: string;
  booking?: {
    fare?: number;
    ticketFare?: number;
    bookingDate?: string;
  };
  passengers: PnrPassenger[];
  assessment?: JourneyAssessment;
}

export interface TimelineStation {
  type?: string; // stoppage | intermediate
  status?: string; // passed | current | upcoming
  stationCode?: string;
  stationName?: string;
  platform?: string;
  distanceKm?: string;
  arrival?: { scheduled?: string; actual?: string; delay?: string };
  departure?: { scheduled?: string; actual?: string; delay?: string };
}

/** Server verdict on whether a validated journey may enter the ordering flow. */
export type AssessCode =
  | 'OK'
  | 'ENDED'
  | 'NOT_STARTED'
  | 'CANCELLED'
  | 'TICKET_CANCELLED'
  | 'WAITLISTED'
  | 'STALE'
  | 'INCOMPLETE';

export interface JourneyAssessment {
  eligible: boolean;
  code: AssessCode;
  message: string;
  journeyStatus: 'upcoming' | 'running' | 'ended' | 'not_started' | 'unknown';
  /** ISO date (YYYY-MM-DD). */
  journeyDate?: string;
  /** Supported RailQuick delivery stations (codes) on this journey. */
  deliveryStations: string[];
  /** Signed proof of validation; present only when eligible. */
  journeyToken?: string;
}

export interface LiveSummary {
  currentLocation?: string;
  latestStation?: { code?: string; name?: string };
  delay?: string;
  nextStation?: { code?: string; name?: string; scheduledArrival?: string };
  lastUpdate?: string;
}

export interface LiveTrackingData {
  trainNo?: string;
  trainName?: string;
  date?: string;
  statusNote?: string;
  lastUpdate?: string;
  currentStationCode?: string;
  totalStations?: number;
  totalDistanceKm?: number;
  progress?: {
    journeyStatus?: string;
    passedStations?: number;
    remainingStations?: number;
    distanceRemainingKm?: number;
    percent?: number;
  };
  timeline: TimelineStation[];
  summary?: LiveSummary;
  assessment?: JourneyAssessment;
}

export interface TrainSearchResultItem {
  trainNo: string;
  trainName: string;
}

export interface StationLiveTrain {
  trainNo?: string;
  trainName?: string;
  sourceName?: string;
  destName?: string;
  platform?: string;
  cancelled?: boolean;
  arrival?: { scheduled?: string; actual?: string; delay?: number };
  departure?: { scheduled?: string; actual?: string; delay?: number };
}

export interface StationLiveBoard {
  summary?: string;
  trains: StationLiveTrain[];
}

/* ------------------------------- Shop Types ------------------------------- */

export type ProductCategory = 'medicines' | 'hygiene' | 'electronics' | 'babycare' | 'comfort';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price_paise: number;
  mrp_paise: number;
  in_stock: number;
  image_url?: string;
  unit: string;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryCheckResult {
  supported: boolean;
  stationChecked: string;
  supportedStations: string[];
  message: string;
}

export interface OrderItem {
  id: string;
  name: string;
  pricePaise: number;
  mrpPaise: number;
  unit: string;
  quantity: number;
  totalPaise: number;
}

export interface OrderConfirmation {
  orderId: string;
  orderRef: string;
  userPhone: string;
  passengerName: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  deliveryStation: string;
  coach: string;
  seatBerth: string;
  items: OrderItem[];
  subtotalPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

/* --------------------------- Unified Journey State ------------------------- */

export type JourneyType = 'pnr' | 'live';

export interface JourneyContext {
  type: JourneyType;
  pnrData?: PnrResponseData;
  liveData?: LiveTrackingData;
  // Unified quick fields for display and delivery prefill
  trainNumber: string;
  trainName: string;
  /** Human-readable journey date, derived from `journeyDateISO`. */
  journeyDate: string;
  /** ISO journey date (YYYY-MM-DD) as established by the server. */
  journeyDateISO: string;
  journeyStatus: JourneyAssessment['journeyStatus'];
  /** Signed server proof that this journey passed validation (required to submit an order/request). */
  journeyToken: string;
  /** Supported RailQuick delivery stations on this journey (empty = not serviceable yet). */
  deliveryStations: string[];
  boardingStation?: string;
  destinationStation?: string;
  defaultCoach?: string;
  defaultSeat?: string;
  passengerName?: string;
  /** Epoch ms when validated; stale journeys are discarded. */
  savedAt: number;
}

/* ------------------------------ Train requests ----------------------------- */

export interface TrainRequestRecord {
  id: string;
  trainName: string;
  trainNumber: string;
  journeyDate: string;
  status: string;
  userPhone?: string | null;
  createdAt: string;
}
