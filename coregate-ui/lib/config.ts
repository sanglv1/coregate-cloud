const DEFAULT_API_BASE_URL = 'http://localhost:8080';

/** Backend URL for Next.js route handlers (server-side only). */
export function getServerApiBaseUrl(): string {
  return (
    process.env.API_BASE_URL ||
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  );
}

/** @deprecated Prefer getServerApiBaseUrl in route handlers. */
export function getApiBaseUrl(): string {
  return getServerApiBaseUrl();
}

/**
 * URL for fetch().
 * - Browser: same-origin `/api/*` (Next.js proxy → backend), avoids CORS and Docker hostnames.
 * - Server: direct backend base URL.
 */
export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    return normalizedPath;
  }
  return `${getServerApiBaseUrl()}${normalizedPath}`;
}
