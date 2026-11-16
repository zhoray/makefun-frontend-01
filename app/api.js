/**
 * app/api.js — public API data layer for make.fun (read-only GET only).
 * Uses ETag revalidation cache + in-flight de-duplication.
 */
const API = 'https://make.fun/api';
const cache = new Map(); // path -> { etag, data, at }
const inflight = new Map(); // path -> Promise

async function get(path) {
  if (inflight.has(path)) return inflight.get(path);
  const run = async () => {
    let entry = cache.get(path);
    const headers = entry?.etag ? { 'If-None-Match': entry.etag } : {};
    const res = await fetch(API + path, { headers });
    if (res.status === 304) return entry.data;
    if (!res.ok) throw new Error(`make.fun API ${res.status} for ${path}`);
    const data = await res.json();
    const etag = res.headers.get('etag');
    cache.set(path, { etag, data, at: Date.now() });
    return data;
  };
  const promise = run();
  inflight.set(path, promise);
  try { return await promise; } finally { inflight.delete(path); }
}

export function apiUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return 'https://make.fun' + path;
}

export function getBounties() { return get('/competitions?status=open&activity=times'); }
export function getBounty(slug) { return get('/competitions/' + encodeURIComponent(slug)); }
export function getLeaderboard(slug) { return get('/competitions/' + encodeURIComponent(slug) + '/leaderboard'); }
export function getProfile(handle) { return get('/profiles/' + encodeURIComponent(handle)); }
