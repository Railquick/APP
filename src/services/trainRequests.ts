import { apiRequest } from './api';
import { TrainRequestRecord } from '../types';

/** Creates a request. Resolves only after the server confirms the Supabase insert (HTTP 201). */
export async function submitTrainRequest(
  token: string,
  payload: {
    journeyToken?: string;
    trainNumber?: string;
    trainName?: string;
    journeyDate?: string;
    areaName?: string;
    userName: string;
    userPhone?: string;
  },
): Promise<TrainRequestRecord> {
  return await apiRequest<TrainRequestRecord>('/api/train-requests', {
    method: 'POST',
    token,
    body: payload,
  });
}

/** The signed-in user's own requests (used to show "already requested"). */
export async function fetchMyTrainRequests(token: string): Promise<TrainRequestRecord[]> {
  return await apiRequest<TrainRequestRecord[]>('/api/train-requests/mine', { token });
}
