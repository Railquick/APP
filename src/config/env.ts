const raw = import.meta.env;

/** All runtime configuration. Values come from `.env` (see `.env.example`). */
export const env = {
  apiBaseUrl: (raw.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
  googleClientId: raw.VITE_GOOGLE_CLIENT_ID ?? '',
  supportUrl: raw.VITE_SUPPORT_URL ?? '',
  instagramUrl: raw.VITE_INSTAGRAM_URL ?? '',
  termsUrl: raw.VITE_TERMS_URL ?? '',
  privacyUrl: raw.VITE_PRIVACY_URL ?? '',
  contentPolicyUrl: raw.VITE_CONTENT_POLICY_URL ?? '',
};
