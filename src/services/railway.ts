import { apiRequest } from './api';
import {
  LiveTrackingData,
  PnrResponseData,
  StationLiveBoard,
  TrainSearchResultItem,
} from '../types';

export async function fetchPnrStatus(pnr: string): Promise<PnrResponseData> {
  return await apiRequest<PnrResponseData>('/api/railway/pnr', {
    method: 'POST',
    body: { pnr },
  });
}

export async function searchTrains(query: string): Promise<TrainSearchResultItem[]> {
  const encoded = encodeURIComponent(query.trim());
  const res = await apiRequest<{ trains: TrainSearchResultItem[] }>(`/api/railway/train-search?q=${encoded}`);
  return res.trains || [];
}

export async function trackTrainLive(trainNumber: string, date: string): Promise<LiveTrackingData> {
  const encNum = encodeURIComponent(trainNumber.trim());
  const encDate = encodeURIComponent(date.trim());
  return await apiRequest<LiveTrackingData>(`/api/railway/train-live?trainNumber=${encNum}&date=${encDate}`);
}

export async function fetchStationLive(stationCode: string, hrs: number = 2): Promise<StationLiveBoard> {
  const encCode = encodeURIComponent(stationCode.trim());
  return await apiRequest<StationLiveBoard>(`/api/railway/station-live?stationCode=${encCode}&hrs=${hrs}`);
}

export async function fetchStationTimetable(stationCode: string, date?: string): Promise<any> {
  const encCode = encodeURIComponent(stationCode.trim());
  const query = date ? `?stationCode=${encCode}&date=${encodeURIComponent(date)}` : `?stationCode=${encCode}`;
  return await apiRequest<any>(`/api/railway/station-timetable${query}`);
}
