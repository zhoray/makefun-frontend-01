/**
 * app/format.js — pure display helpers (no imports).
 */
const escapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => escapes[ch]);
}

export function money(value) {
  const n = Number(value);
  const opts = { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2 };
  return n.toLocaleString('en-US', opts);
}

export function date(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
}

export function shortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function timeLeft(iso) {
  const diff = Date.parse(iso) - Date.now();
  if (diff <= 0) return 'ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (parts.length === 0 || secs > 0) parts.push(`${secs}s`);
  return parts.join(' ') + ' left';
}

export function rate(micro) {
  return (Number(micro) / 10000).toFixed(2) + '%';
}

export function count(n) {
  return Number(n).toLocaleString('en-US');
}

export function plural(n, word) {
  return count(n) + ' ' + word + (Number(n) === 1 ? '' : 's');
}
