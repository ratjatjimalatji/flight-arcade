// Deterministic pixel-art looks derived from database ids, so the same
// passenger always wears the same outfit across reloads.

export const SKIN = ['#f6d2b0', '#e8b48a', '#c98b5e', '#8d5a3b', '#5a3825'];
export const HAIR = ['#2b1d14', '#5b3a1e', '#a8652c', '#e2c06a', '#1a1a1a', '#8a8a8a'];
export const SHIRT = ['#d9453b', '#3b7dd8', '#3fa34d', '#f0b429', '#8e5bd1', '#f2f2ea', '#e2733b'];
export const PANTS = ['#2d3a5c', '#4a4a4a', '#6b4b2e', '#1f5f5b'];
export const BAG = ['#b13a3a', '#2f5fa8', '#3e8a4a', '#6b4b2e', '#5a5a6e', '#d48a1e'];

function pick<T>(list: T[], seed: number, salt: number): T {
  // small integer hash (murmur3 finaliser) so neighbouring ids look different
  let h = (seed * 0x9e3779b1 + salt * 0x85ebca6b) | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return list[(h >>> 0) % list.length];
}

export interface PersonLook {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
}

export function lookFor(passengerId: number): PersonLook {
  return {
    skin: pick(SKIN, passengerId, 1),
    hair: pick(HAIR, passengerId, 2),
    shirt: pick(SHIRT, passengerId, 3),
    pants: pick(PANTS, passengerId, 4),
  };
}

export function bagColor(passengerId: number, index: number): string {
  return pick(BAG, passengerId * 7 + index, 5);
}

// Livery per airline name (operatingAirlines). Unknown airlines get a stable colour.
const KNOWN: Record<string, string> = {
  'american airlines': '#c8323a',
  'south west': '#2c4fa3',
  southwest: '#2c4fa3',
  'united airlines': '#1d6fb8',
  delta: '#9b1d32',
  'south african airways': '#0a4a8f',
  flysafair: '#e8711a',
  airlink: '#6b2c91',
  cemair: '#1f8a8a',
};
const FALLBACK = ['#2e8b57', '#d2691e', '#6a4fb3', '#b8860b', '#20808a'];

export function liveryFor(airline: string): string {
  const key = airline.trim().toLowerCase();
  if (KNOWN[key]) return KNOWN[key];
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return FALLBACK[Math.abs(h) % FALLBACK.length];
}

export function fullName(p: { firstName: string; middleName?: string | null; lastName: string }): string {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
}

export function formatTime(iso: string | null): string {
  if (!iso) return '--:--';
  const t = iso.split('T')[1];
  return t ? t.slice(0, 5) : '--:--';
}
