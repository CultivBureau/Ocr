/**
 * Base URL for server-side fetches to the FastAPI backend (RSC, Route Handlers, Playwright PDF).
 *
 * Use SERVER_API_BASE_URL when Next.js runs in Docker and cannot reach the API at
 * localhost:8000 from the Node process (e.g. http://host.docker.internal:8000 or http://api:8000).
 * NEXT_PUBLIC_API_BASE_URL is used as fallback and must point at the same API the browser uses.
 */
export function getServerApiBaseUrl(): string {
  return (
    process.env.SERVER_API_BASE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8000"
  );
}
