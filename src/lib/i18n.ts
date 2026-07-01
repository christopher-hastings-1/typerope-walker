import { useSyncExternalStore } from "react";

export type Lang = "en" | "lt";

type StringTable = Record<string, string | ((...args: any[]) => string)>;

export const STRINGS: Record<Lang, StringTable> = {
  en: {
    btnTryAgain: "TRY AGAIN",
    btnPlayAgain: "PLAY AGAIN",
    typeAnyWord: "TYPE ANY WORD",
    freeWord: "FREE WORD",
    nLetterWord: (n: number) => `${n}-LETTER WORD`,
    checking: "checking…",
    pressEnter: "press enter",
    finishLabel: "FINISH",
    youFell: "YOU FELL.",
    youFellSub: "Choose your words more carefully next time.",
    youMadeIt: "YOU MADE IT!",
    youMadeItSub: "You used your words and stayed balanced.",
    finishedIn: (t: string) => ` Finished in ${t}.`,
    speedBonus: (b: number) => ` ⚡ +${b} speed bonus`,
    pts: "PTS",
    pbLabel: "PERSONAL BEST",
    pbNew: "🎉 NEW PERSONAL BEST!",
    lbTitle: "🏆 Leaderboard",
    lbSave: "SAVE",
    lbPlaceholder: "First name + last initial",
    langChoose: "Choose your language / Pasirinkite kalbą",
    langEn: "🇬🇧 ENGLISH",
    langLt: "🇱🇹 LIETUVIŲ",
    coachTiltLeft: "That word tipped me LEFT. The next one will bring me RIGHT.",
    coachTiltRight: "That word tipped me RIGHT. The next one will bring me LEFT.",
    coachEdge: "I'm about to fall! The right word can bring me back in balance.",
    crowdPerfect: "PERFECT!",
    crowdRareLong: (len: number) => `×2 RARE — ${len} LETTERS!`,
    crowdRare: "RARE LETTER! ×2",
    crowdLong3: (len: number) => `${len} LETTERS! ×3`,
    crowdLong2: (len: number) => `${len} LETTERS! ×2`,
    crowdLong15: "×1.5",
    crowdOnARoll: "ON A ROLL!",
    crowdJustInTime: "JUST IN TIME!",
  },
  lt: {
    btnTryAgain: "BANDYTI DAR",
    btnPlayAgain: "ŽAISTI DAR",
    typeAnyWord: "RAŠYKITE BET KOKĮ ŽODĮ",
    freeWord: "LAISVAS ŽODIS",
    nLetterWord: (n: number) => `${n} RAIDŽIŲ ŽODIS`,
    checking: "tikrinama…",
    pressEnter: "spauskite enter",
    finishLabel: "FINIŠAS",
    youFell: "PARGRIUVAI.",
    youFellSub: "Kitą kartą rinkitės žodžius atidžiau.",
    youMadeIt: "PAVYKO!",
    youMadeItSub: "Panaudojote žodžius ir išlaikėte balansą.",
    finishedIn: (t: string) => ` Įveikta per ${t}.`,
    speedBonus: (b: number) => ` ⚡ +${b} greičio premija`,
    pts: "T.",
    pbLabel: "GERIAUSIAS REZULTATAS",
    pbNew: "🎉 NAUJAS REKORDAS!",
    lbTitle: "🏆 Lyderių lentelė",
    lbSave: "IŠSAUGOTI",
    lbPlaceholder: "Vardas + pavardės raidė",
    langChoose: "Choose your language / Pasirinkite kalbą",
    langEn: "🇬🇧 ENGLISH",
    langLt: "🇱🇹 LIETUVIŲ",
    coachTiltLeft: "Šis žodis pakreipė mane į KAIRĘ. Kitas grąžins į DEŠINĘ.",
    coachTiltRight: "Šis žodis pakreipė mane į DEŠINĘ. Kitas grąžins į KAIRĘ.",
    coachEdge: "Tuoj krisiu! Tinkamas žodis grąžins į balansą.",
    crowdPerfect: "TOBULA!",
    crowdRareLong: (len: number) => `×2 RETA — ${len} RAIDŽIŲ!`,
    crowdRare: "RETA RAIDĖ! ×2",
    crowdLong3: (len: number) => `${len} RAIDŽIŲ! ×3`,
    crowdLong2: (len: number) => `${len} RAIDŽIŲ! ×2`,
    crowdLong15: "×1.5",
    crowdOnARoll: "NESUSTABDOMAS!",
    crowdJustInTime: "LAIKU!",
  },
};

const STORAGE_KEY = "tightrope_lang";

let currentLang: Lang | null = null;
const listeners = new Set<() => void>();

function readStored(): Lang | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "en" || v === "lt" ? v : null;
}

// Lazy init on first read in the browser.
function ensureInit() {
  if (currentLang === null && typeof window !== "undefined") {
    currentLang = readStored();
  }
}

export function getLang(): Lang | null {
  ensureInit();
  return currentLang;
}

export function setLang(l: Lang) {
  currentLang = l;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, l);
  }
  listeners.forEach((fn) => fn());
}

export function clearLang() {
  currentLang = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useLang(): Lang | null {
  return useSyncExternalStore(
    subscribe,
    () => getLang(),
    () => null,
  );
}

export function t(key: string, ...args: any[]): string {
  const lang = getLang() ?? "en";
  const entry = STRINGS[lang][key] ?? STRINGS.en[key];
  if (entry === undefined) return key;
  return typeof entry === "function" ? entry(...args) : entry;
}

export function useT() {
  const lang = useLang();
  // Re-create binding so consumers re-render on lang change.
  return (key: string, ...args: any[]) => {
    const l = lang ?? "en";
    const entry = STRINGS[l][key] ?? STRINGS.en[key];
    if (entry === undefined) return key;
    return typeof entry === "function" ? entry(...args) : entry;
  };
}
