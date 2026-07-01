import type { Lang } from "./i18n";

export type LBEntry = {
  name: string;
  score: number;
  stars?: number;
  ts: number;
};

const NAME_KEY = "tightrope_player_name";
const PB_KEY = (lang: Lang) => `tightrope_pb_${lang}`;
const LB_KEY = (lang: Lang) => `tightrope_leaderboard_${lang}`;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadLeaderboard(lang: Lang): LBEntry[] {
  return safeGet<LBEntry[]>(LB_KEY(lang), []);
}

export function saveEntry(lang: Lang, entry: Omit<LBEntry, "ts">): LBEntry {
  const full: LBEntry = { ...entry, ts: Date.now() };
  const lb = loadLeaderboard(lang);
  lb.push(full);
  lb.sort((a, b) => b.score - a.score);
  safeSet(LB_KEY(lang), lb.slice(0, 50));
  safeSet(NAME_KEY, entry.name);
  const pb = loadPersonalBest(lang);
  if (entry.score > pb) safeSet(PB_KEY(lang), entry.score);
  return full;
}

export function loadPersonalBest(lang: Lang): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(PB_KEY(lang));
  return v ? Number(v) || 0 : 0;
}

export function loadPlayerName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) || "";
}
