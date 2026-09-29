/**
 * PackSmart AI - Central API Base Configuration
 * Automatically uses VITE_API_URL or VITE_API_BASE_URL if configured in environment (e.g. on Vercel),
 * ensures the '/api' suffix is always present, and falls back to '/api' for local dev.
 */
function resolveApiBase(): string {
  const raw = (
    (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    ''
  ).trim().replace(/\/+$/, '');

  if (!raw || raw === '/api') {
    return '/api';
  }

  // If a full backend URL was provided (e.g. https://sih-2-backend.onrender.com),
  // ensure it points to the '/api' prefix where FastAPI routers are registered.
  if (!raw.endsWith('/api')) {
    return `${raw}/api`;
  }

  return raw;
}

export const API_BASE = resolveApiBase();

