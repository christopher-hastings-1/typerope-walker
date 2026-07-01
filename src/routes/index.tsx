import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CoachMark } from "@/components/game/CoachMark";
import { FinishBanner } from "@/components/game/FinishBanner";
import { InputPanel } from "@/components/game/InputPanel";
import { LangBadge } from "@/components/game/LangBadge";
import { LanguageSelect } from "@/components/game/LanguageSelect";
import { Overlay } from "@/components/game/Overlay";
import { PaperGrain } from "@/components/game/PaperGrain";
import { PointsPopupLayer, type Popup } from "@/components/game/PointsPopup";
import { Rope } from "@/components/game/Rope";
import { SoundToggle } from "@/components/game/SoundToggle";
import { Walker } from "@/components/game/Walker";
import { WordTrail, type WordEntry } from "@/components/game/WordTrail";
import { isRealWord } from "@/lib/dictionary";
import { useLang, useT } from "@/lib/i18n";
import { loadPersonalBest } from "@/lib/leaderboard";
import { hasRareLetter, scoreWord, speedBonusFor } from "@/lib/score";
import { playSound } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tightrope — Typing Balance Game" },
      {
        name: "description",
        content:
          "A playful paper-cutout typing game. Keep the walker balanced by typing words of the right length.",
      },
      { property: "og:title", content: "Tightrope — Typing Balance Game" },
      {
        property: "og:description",
        content:
          "A playful paper-cutout typing game. Keep the walker balanced by typing words of the right length.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b90b6ea8-bc78-424c-b150-dcc61e93aedc/id-preview-1d735070--16f15207-cdd5-45c2-b2f5-1b67ccc8274b.lovable.app-1782895584225.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b90b6ea8-bc78-424c-b150-dcc61e93aedc/id-preview-1d735070--16f15207-cdd5-45c2-b2f5-1b67ccc8274b.lovable.app-1782895584225.png",
      },
    ],
  }),
  component: TightropeGame,
});

type Status = "playing" | "fell" | "won";

const TOTAL_PAIRS = 10;
const MAX_BALANCE = 5;
const LT_LETTERS = "a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ";
const POPUP_TTL = 2000;

function lerpHex(a: string, b: string, t: number) {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

function backgroundGradient(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  const bottom = lerpHex("#E8D9B8", "#F5EDDC", p);
  const mid = lerpHex("#F0E2C4", "#EAF1F5", p);
  const top = lerpHex("#F5EDDC", "#D9E6EF", p);
  return `linear-gradient(to top, ${bottom} 0%, ${mid} 50%, ${top} 100%)`;
}

function TightropeGame() {
  const lang = useLang();
  const t = useT();

  const [entries, setEntries] = useState<WordEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("playing");
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());
  const [checking, setChecking] = useState(false);
  const [shake, setShake] = useState(false);
  const [stepKey, setStepKey] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(() => Date.now());
  const [wordShownAt, setWordShownAt] = useState<number>(() => Date.now());
  const [totalSec, setTotalSec] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const wordCount = entries.length;
  const nextSide: "left" | "right" = wordCount % 2 === 0 ? "left" : "right";
  const lastWord = entries[entries.length - 1]?.word;
  const requiredLetterRaw = lastWord ? lastWord[lastWord.length - 1].toUpperCase() : null;
  const isWildcard = requiredLetterRaw === "X";
  const requiredPrefix = requiredLetterRaw && !isWildcard ? requiredLetterRaw : "";
  const isFirstWord = wordCount === 0;
  const isFreeWord = isFirstWord || balance === 0;
  const targetLength = isFreeWord ? null : Math.abs(balance);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === "playing") focusInput();
  }, [status, wordCount, focusInput]);

  useEffect(() => {
    setWordShownAt(Date.now());
  }, [wordCount]);

  useEffect(() => {
    const handler = () => {
      if (status === "playing") focusInput();
    };
    window.addEventListener("click", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [focusInput, status]);

  const reset = () => {
    const now = Date.now();
    setEntries([]);
    setBalance(0);
    setInput("");
    setChecking(false);
    setStepKey(0);
    setScore(0);
    setStreak(0);
    setPopups([]);
    setTotalSec(0);
    setSpeedBonus(0);
    setDismissedHints(new Set());
    setGameStartTime(now);
    setWordShownAt(now);
    setStatus("playing");
  };

  const fall = (delay = 350) => {
    playSound("fall");
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setTimeout(() => setStatus("fell"), delay);
  };

  const pushPopup = (p: Popup) => {
    setPopups((prev) => [...prev, p]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((x) => x.id !== p.id));
    }, POPUP_TTL);
  };

  const submit = async () => {
    if (status !== "playing" || checking) return;
    const raw = (requiredPrefix + input).trim().toLowerCase();
    if (raw.length < 2) return;
    const currentLang = lang ?? "en";

    setChecking(true);
    const valid = await isRealWord(raw, currentLang);
    setChecking(false);

    const isRepeat = entries.some((e) => e.word === raw);
    if (!valid || isRepeat) {
      fall();
      return;
    }

    const delta = nextSide === "left" ? -raw.length : raw.length;
    const newBalance = balance + delta;

    const entryProgress = Math.floor(entries.length / 2) / TOTAL_PAIRS;
    const newEntry: WordEntry = {
      word: raw,
      side: nextSide,
      length: raw.length,
      progress: entryProgress,
    };
    const newEntries = [...entries, newEntry];

    if (!isFreeWord && Math.abs(newBalance) > MAX_BALANCE) {
      setEntries(newEntries);
      setBalance(newBalance);
      setInput("");
      setStepKey((k) => k + 1);
      fall(400);
      return;
    }

    const newStreak = streak + 1;
    const msSinceShown = Date.now() - wordShownAt;
    const result = scoreWord({
      wordLen: raw.length,
      balanceAfter: newBalance,
      msSinceShown,
      streak: newStreak,
      hasRare: hasRareLetter(raw, currentLang),
    });
    const newScore = score + result.total;

    setEntries(newEntries);
    setBalance(newBalance);
    setInput("");
    setStepKey((k) => k + 1);
    setStreak(newStreak);
    setScore(newScore);
    pushPopup({ id: Date.now(), points: result.total, bonuses: result.bonuses });

    playSound("submit");
    if (newBalance === 0) playSound("perfect");
    if (newStreak > 0 && newStreak % 3 === 0) playSound("streak");
    if (Math.abs(newBalance) >= 4 && status === "playing") playSound("warning");

    if (newEntries.length >= TOTAL_PAIRS * 2) {
      const sec = Math.round((Date.now() - gameStartTime) / 1000);
      const bonus = speedBonusFor(sec);
      setTotalSec(sec);
      setSpeedBonus(bonus);
      if (bonus > 0) setScore(newScore + bonus);
      setStatus("won");
      playSound("win");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
  };

  const ltLetterRx = useMemo(() => new RegExp(`[^${LT_LETTERS}]`, "g"), []);
  const enLetterRx = useMemo(() => /[^a-zA-Z]/g, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const rx = lang === "lt" ? ltLetterRx : enLetterRx;
    const letters = v.replace(rx, "");
    setInput(letters.toLowerCase());
  };

  const pairsCompleted = Math.floor(wordCount / 2);
  const progress = pairsCompleted / TOTAL_PAIRS;

  // Progressive coach marks — one hint at a time, in priority order.
  const hintCandidates: { id: string; key: string; when: boolean }[] = [
    {
      id: "tilt",
      key: balance < 0 ? "coachTiltLeft" : "coachTiltRight",
      when: entries.length === 1 && balance !== 0,
    },
    { id: "edge", key: "coachEdge", when: Math.abs(balance) >= 4 },
  ];
  const nextHint = hintCandidates.find(
    (h) => h.when && !dismissedHints.has(h.id),
  );
  const activeHint = nextHint?.id ?? null;
  const activeHintKey = nextHint?.key ?? null;
  const dismissActiveHint = () => {
    if (!activeHint) return;
    setDismissedHints((prev) => {
      const next = new Set(prev);
      next.add(activeHint);
      return next;
    });
  };

  const personalBest = loadPersonalBest(lang ?? "en");
  const isPB = score > personalBest;

  const winSubtitle = (() => {
    let s = t("youMadeItSub");
    if (totalSec > 0) {
      const mm = Math.floor(totalSec / 60);
      const ss = String(totalSec % 60).padStart(2, "0");
      s += t("finishedIn", `${mm}:${ss}`);
      if (speedBonus > 0) s += t("speedBonus", speedBonus);
    }
    return s;
  })();

  if (lang === null) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "#F5EDDC" }}>
        <PaperGrain />
        <LanguageSelect />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden transition-colors"
      style={{ background: backgroundGradient(progress), color: "#2A1E16" }}
    >
      <PaperGrain />

      <Rope balance={balance} maxBalance={MAX_BALANCE} walkerProgress={progress} shake={shake} />

      <FinishBanner />

      <WordTrail entries={entries} />

      <Walker
        progress={progress}
        balance={balance}
        maxBalance={MAX_BALANCE}
        state={status}
        stepKey={stepKey}
        streak={streak}
      />

      <SoundToggle />
      <LangBadge />

      <PointsPopupLayer popups={popups} />

      {status === "playing" && (
        <InputPanel
          side={nextSide}
          prefix={requiredPrefix}
          isWildcard={isWildcard}
          isFreeWord={isFreeWord}
          isFirstWord={isFirstWord}
          targetLength={targetLength}
          maxOverflow={MAX_BALANCE}
          input={input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          inputRef={inputRef}
          checking={checking}
          shake={shake}
          pairsCompleted={pairsCompleted}
          total={TOTAL_PAIRS}
        />
      )}

      {status === "playing" && (
        <CoachMark
          id={activeHint}
          text={activeHint ? t(activeHintKey!) : ""}
          onDismiss={dismissActiveHint}
          balance={balance}
          maxBalance={MAX_BALANCE}
          progress={progress}
        />
      )}


      <AnimatePresence>
        {status === "fell" && (
          <Overlay
            key="fell"
            title={t("youFell")}
            subtitle={t("youFellSub")}
            buttonText={t("btnTryAgain")}
            onClick={reset}
            score={score}
            personalBest={personalBest}
            isPB={isPB}
          />
        )}
        {status === "won" && (
          <Overlay
            key="won"
            title={t("youMadeIt")}
            subtitle={winSubtitle}
            buttonText={t("btnPlayAgain")}
            onClick={reset}
            showConfetti
            score={score}
            personalBest={personalBest}
            isPB={isPB}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
