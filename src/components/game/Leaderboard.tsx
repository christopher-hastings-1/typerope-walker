import { useState } from "react";
import { motion } from "framer-motion";
import { useLang, useT } from "@/lib/i18n";
import {
  loadLeaderboard,
  loadPlayerName,
  saveEntry,
  type LBEntry,
} from "@/lib/leaderboard";

export function Leaderboard({
  score,
  isPB,
}: {
  score: number;
  isPB: boolean;
}) {
  const t = useT();
  const lang = useLang() ?? "en";
  const [name, setName] = useState<string>(() => loadPlayerName());
  const [savedTs, setSavedTs] = useState<number | null>(null);
  const [list, setList] = useState<LBEntry[]>(() => loadLeaderboard(lang));

  const save = () => {
    const n = name.trim();
    if (!n) return;
    const entry = saveEntry(lang, { name: n, score });
    setSavedTs(entry.ts);
    setList(loadLeaderboard(lang));
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      save();
    }
  };

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3 pt-1">
      {isPB && (
        <div className="font-handwritten text-base text-[#6B8E5A]">
          {t("pbNew")}
        </div>
      )}

      {savedTs === null && (
        <div className="flex w-full items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 12))}
            onKeyDown={onKey}
            placeholder={t("lbPlaceholder")}
            maxLength={12}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-md bg-[#FBF4E4] px-3 py-1.5 font-handwritten text-base uppercase tracking-wide text-[#2A1E16] outline-none"
            style={{ border: "1.5px solid #3A2A1F" }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={save}
            className="rounded-md bg-[#E5A23C] px-3 py-1.5 font-handwritten text-base text-[#2A1E16] shadow-[2px_2px_0_#2A1E16]"
            style={{ border: "1.5px solid #2A1E16" }}
          >
            {t("lbSave")}
          </motion.button>
        </div>
      )}

      {list.length > 0 && (
        <div className="w-full border-t border-[#3A2A1F]/20 pt-2">
          <div className="mb-1 font-handwritten text-sm uppercase tracking-wider text-[#8B6F4E]">
            {t("lbTitle")}
          </div>
          <ul className="flex flex-col">
            {list.slice(0, 10).map((e, i) => {
              const hi = savedTs !== null && e.ts === savedTs;
              return (
                <li
                  key={`${e.ts}-${i}`}
                  className="flex items-center gap-2 py-0.5 text-sm font-handwritten"
                  style={{
                    color: hi ? "#D55B3A" : "#2A1E16",
                    background: hi ? "rgba(229,162,60,0.18)" : "transparent",
                    borderRadius: 4,
                    padding: "2px 4px",
                  }}
                >
                  <span className="w-5 text-right text-[#8B6F4E]">{i + 1}</span>
                  <span className="flex-1 truncate uppercase tracking-wide">
                    {e.name}
                  </span>
                  <span className="tabular-nums font-bold text-[#D55B3A]">
                    {e.score.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

