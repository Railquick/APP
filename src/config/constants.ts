/**
 * RailQuick Application Constants & Configuration
 * Hazrat Nizamuddin (NZM) Pilot Phase
 */

const isWeb = typeof window !== 'undefined';
const isLocalhost =
  isWeb &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

const envApiUrl =
  typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : undefined;

// When running in web production (not on localhost) or when env var points to localhost or is unset,
// strictly point to the production backend URL on Render.
export const API_BASE_URL: string =
  isWeb && !isLocalhost
    ? 'https://railquick-backend.onrender.com'
    : envApiUrl && !envApiUrl.includes('localhost')
    ? envApiUrl
    : 'https://railquick-backend.onrender.com';

export const SUPPORT_CONFIG = {
  // 24x7 Station Operations & Hub Support
  PHONE_NUMBER: '+918882779769',
  PHONE_DISPLAY: '+91 88827 79769',
  WHATSAPP_NUMBER: '918882779769',
  STATION_CODE: 'NZM',
  STATION_NAME: 'Hazrat Nizamuddin',
  STATION_HUB_TITLE: 'Hazrat Nizamuddin (NZM) Station Ops Hub',
  DEFAULT_WHATSAPP_MESSAGE:
    'Hi RailQuick, I need help with my order at NZM Station',
  OPERATING_HOURS: '24x7 Live Platform & Berth Delivery Ops',
  SUPPORT_EMAIL: 'support@railquick.in',
};

/**
 * Returns formatted tel: URL for direct phone dialing
 */
export const getCallUrl = (phone: string = SUPPORT_CONFIG.PHONE_NUMBER): string => {
  return `tel:${phone}`;
};

/**
 * Returns formatted WhatsApp wa.me URL with pre-filled message
 */
export const getWhatsAppUrl = (
  phone: string = SUPPORT_CONFIG.WHATSAPP_NUMBER,
  message: string = SUPPORT_CONFIG.DEFAULT_WHATSAPP_MESSAGE
): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
