import type { PlayAction, RerollPolicy } from '../domain/types';
const KEY = 'nufflecalc:last-play';
export interface SavedPlay { version: 1; actions: PlayAction[]; teamRerolls: number; policy: RerollPolicy }

export function loadPlay(): SavedPlay | null {
  try { const data = localStorage.getItem(KEY); if (!data) return null; const parsed: unknown = JSON.parse(data); return valid(parsed) ? parsed : null; } catch { return null; }
}
export function savePlay(play: SavedPlay) { localStorage.setItem(KEY, JSON.stringify(play)); }
export function encodePlay(play: SavedPlay) { return btoa(unescape(encodeURIComponent(JSON.stringify(play)))); }
export function decodePlay(encoded: string): SavedPlay | null { try { const parsed: unknown = JSON.parse(decodeURIComponent(escape(atob(encoded)))); return valid(parsed) ? parsed : null; } catch { return null; } }
function valid(value: unknown): value is SavedPlay { return !!value && typeof value === 'object' && (value as SavedPlay).version === 1 && Array.isArray((value as SavedPlay).actions) && typeof (value as SavedPlay).teamRerolls === 'number'; }
