import { AreaRequestPayload, ServiceabilityStatus } from '../types';
import { apiRequest, NotConfiguredError } from './api';

/**
 * BACKEND CONTRACT (to be confirmed):
 *   GET {VITE_API_BASE_URL}/serviceability   (Bearer token)
 *   200 -> { serviceable: boolean, areaTitle: string, areaAddress: string }
 *
 * Returns null while the backend isn't configured so the UI can show its
 * design placeholder instead of pretending to have real data.
 */
export async function fetchServiceability(token: string): Promise<ServiceabilityStatus | null> {
  try {
    return await apiRequest<ServiceabilityStatus>('/api/serviceability', { token });
  } catch (error) {
    if (error instanceof NotConfiguredError) return null;
    throw error;
  }
}

/**
 * BACKEND CONTRACT (to be confirmed):
 *   POST {VITE_API_BASE_URL}/api/area-requests  (Bearer token)  body: { area, phone }
 *   2xx -> saved. Throws NotConfiguredError until the backend URL is set.
 */
export async function submitAreaRequest(token: string, payload: AreaRequestPayload): Promise<void> {
  await apiRequest<unknown>('/api/area-requests', { method: 'POST', token, body: payload });
}
