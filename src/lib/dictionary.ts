import type { Lang } from "./i18n";

async function checkDatamuse(word: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&max=1`,
    );
    const data = (await res.json()) as Array<{ word: string }>;
    return data.length > 0 && data[0].word.toLowerCase() === word.toLowerCase();
  } catch {
    return false;
  }
}

// Query Lithuanian Wiktionary — an entry page whose title matches the word
// (in any common casing) means it's a real Lithuanian word.
async function checkLtWiktionary(word: string): Promise<boolean> {
  const w = word.trim();
  if (!w) return false;
  const variants = Array.from(
    new Set([
      w.toLowerCase(),
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    ]),
  );
  const titles = variants.join("|");
  const url =
    `https://lt.wiktionary.org/w/api.php?action=query&format=json` +
    `&origin=*&redirects=1&titles=${encodeURIComponent(titles)}`;
  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { missing?: string; title?: string }> };
    };
    const pages = data.query?.pages ?? {};
    return Object.values(pages).some((p) => p.missing === undefined);
  } catch {
    return false;
  }
}

export async function isRealWord(word: string, lang: Lang = "en"): Promise<boolean> {
  if (lang === "lt") return checkLtWiktionary(word);
  return checkDatamuse(word);
}
