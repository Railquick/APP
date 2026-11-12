import { API_BASE_URL } from '../config/constants';

export interface PNRVerificationResponse {
  valid: boolean;
  pnr: string;
  train_number: string;
  train_name: string;
  station_code: string;
  arrival_time?: string;
  coach?: string;
  seat?: string;
  pnr_status?: string;
}

/**
 * Verify live PNR status and NZM delivery eligibility with the RailQuick backend.
 * Calls POST /api/v1/trains/verify-pnr on the production backend.
 */
export const verifyPNR = async (pnr: string): Promise<PNRVerificationResponse> => {
  const cleanPnr = pnr.replace(/[^0-9]/g, '');

  if (!cleanPnr || cleanPnr.length !== 10) {
    throw new Error('Please enter a valid 10-digit Indian Railways PNR number');
  }

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('railquick_token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token')
      : null;

  const endpoints = [
    `${API_BASE_URL.replace(/\/$/, '')}/api/v1/trains/verify-pnr`,
    'https://railquick-backend.onrender.com/api/v1/trains/verify-pnr',
  ];

  let lastErrorMessage =
    'RailQuick delivery is currently available only for trains halting at Hazrat Nizamuddin (NZM)';

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pnr: cleanPnr }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data) {
        return data as PNRVerificationResponse;
      }

      // Handle 400 Bad Request or upstream error from backend
      const detailMsg =
        data?.detail ||
        data?.message ||
        (response.status === 400
          ? 'RailQuick delivery is currently available only for trains halting at Hazrat Nizamuddin (NZM)'
          : 'Failed to verify PNR');

      throw new Error(detailMsg);
    } catch (err: any) {
      // If it's already the NZM eligibility or validation error from backend, rethrow it
      if (
        err?.message &&
        (err.message.includes('Hazrat Nizamuddin') ||
          err.message.includes('NZM') ||
          err.message.includes('Invalid PNR'))
      ) {
        throw err;
      }
      lastErrorMessage = err?.message || lastErrorMessage;
    }
  }

  throw new Error(lastErrorMessage);
};

export const trainService = {
  verifyPNR,
};

export default trainService;
