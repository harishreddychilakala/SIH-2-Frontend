/**
 * PackSmart AI - Central API Base Configuration
 * Automatically uses VITE_API_URL or VITE_API_BASE_URL if configured in environment (e.g. on Vercel),
 * otherwise defaults to '/api' (for local Vite proxy).
 */
export const API_BASE = (
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  '/api'
).replace(/\/$/, '');
