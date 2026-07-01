import type { Lang } from "./i18n";

const RARE_EN = new Set(["j", "q", "x", "z"]);
const RARE_LT = new Set(["f", "h", "x", "q", "w"]);

export function hasRareLetter(word: string, lang: Lang): boolean {
  const set = lang === "lt" ? RARE_LT : RARE_EN;
  const w = word.toLowerCase();
  for (const c of w) if (set.has(c)) return true;
  return false;
}

export type ScoreInput = {
  wordLen: number;
  balanceAfter: number;
  msSinceShown: number;
  streak: number;
  hasRare: boolean;
};

export type Bonus = { key: string; args?: unknown[] };
export type ScoreResult = { total: number; bonuses: Bonus[] };

export function scoreWord({
  wordLen,
  balanceAfter,
  msSinceShown,
  streak,
  hasRare,
}: ScoreInput): ScoreResult {
  const speed = Math.max(0, Math.min(60, 60 * (1 - msSinceShown / 8000)));
  const ab = Math.abs(balanceAfter);
  const balanceBonus =
    ab === 0 ? 300 : ab === 1 ? 150 : ab <= 3 ? 75 : ab <= 6 ? 25 : 0;
  const streakMult = 1 + 0.25 * Math.floor(streak / 3);
  const rareMult = hasRare ? 2 : 1;
  const lengthMult =
    wordLen <= 3
      ? 0.75
      : wordLen <= 5
        ? 1
        : wordLen <= 7
          ? 1.5
          : wordLen <= 9
            ? 2
            : 3;
  const total = Math.round(
    (speed + balanceBonus) * streakMult * rareMult * lengthMult,
  );

  const bonuses: Bonus[] = [];
  if (balanceAfter === 0) bonuses.push({ key: "crowdPerfect" });
  if (hasRare && wordLen >= 8)
    bonuses.push({ key: "crowdRareLong", args: [wordLen] });
  else if (hasRare) bonuses.push({ key: "crowdRare" });
  if (wordLen >= 10) bonuses.push({ key: "crowdLong3", args: [wordLen] });
  else if (wordLen >= 8) bonuses.push({ key: "crowdLong2", args: [wordLen] });
  else if (wordLen >= 6) bonuses.push({ key: "crowdLong15" });
  if (streak > 0 && streak % 3 === 0) bonuses.push({ key: "crowdOnARoll" });
  if (msSinceShown < 1500) bonuses.push({ key: "crowdJustInTime" });

  return { total, bonuses };
}

export function speedBonusFor(totalSec: number): number {
  if (totalSec < 90) return 3000;
  if (totalSec < 120) return 2000;
  if (totalSec < 150) return 1200;
  if (totalSec < 180) return 600;
  if (totalSec < 210) return 250;
  return 0;
}
