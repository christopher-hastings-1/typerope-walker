import { motion } from "framer-motion";
import { walkerTopPct } from "@/lib/rope";

export type WordEntry = { word: string; side: "left" | "right"; length: number; progress: number };

function Sparkles() {
  const sparkles = [
    { left: "-30%", top: "-40%", delay: 0, size: 10 },
    { left: "90%", top: "-30%", delay: 0.08, size: 12 },
    { left: "110%", top: "50%", delay: 0.2, size: 8 },
    { left: "40%", top: "-60%", delay: 0.14, size: 9 },
    { left: "70%", top: "100%", delay: 0.26, size: 7 },
  ] as const;
  return (
    <span className="pointer-events-none absolute inset-0 overflow-visible">
      {sparkles.map((s, i) => (
        <motion.svg
          key={i}
          width={s.size * 2}
          height={s.size * 2}
          viewBox="0 0 20 20"
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0],
            rotate: [0, 60, 120],
          }}
          transition={{
            duration: 1.2,
            delay: s.delay,
            ease: "easeOut",
            times: [0, 0.3, 0.6, 1],
          }}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
          }}
        >
          <path
            d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z"
            fill="#E5A23C"
          />
        </motion.svg>
      ))}
    </span>
  );
}

function MiniSlot({
  letter,
  index,
  highlight,
}: {
  letter: string;
  index: number;
  highlight?: boolean;
}) {
  return (
    <motion.span
      initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
      animate={{
        scale: 1,
        rotate: index % 2 === 0 ? -1.5 : 1.5,
        opacity: 1,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 22, delay: index * 0.03 }}
      className="relative inline-flex items-center justify-center font-handwritten uppercase"
      style={{
        width: "1.4rem",
        height: "1.7rem",
        borderRadius: "4px",
        background: highlight ? "#FFE9B8" : "#FBF4E4",
        border: `1.25px solid ${highlight ? "#D55B3A" : "#3A2A1F"}`,
        boxShadow: highlight
          ? "1.5px 1.5px 0 rgba(213,91,58,0.35)"
          : "1.5px 1.5px 0 rgba(58,42,31,0.18)",
        color: highlight ? "#B33A1F" : "#2A1E16",
        fontSize: "1.15rem",
        lineHeight: 1,
      }}
    >
      {letter}
      {highlight && <Sparkles />}
    </motion.span>
  );
}

export function WordTrail({ entries }: { entries: WordEntry[] }) {
  const lastIndex = entries.length - 1;
  return (
    <>
      {entries.map((e, i) => {
        const top = walkerTopPct(e.progress);
        const isLeft = e.side === "left";
        const letters = e.word.toUpperCase().split("");
        const isNewest = i === lastIndex;
        return (
          <motion.div
            key={`${i}-${e.word}`}
            initial={{ opacity: 0, x: isLeft ? 40 : -40, scale: 0.6, rotate: isLeft ? -8 : 8 }}
            animate={{ opacity: 0.9, x: 0, scale: 1, rotate: isLeft ? -3 : 3 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="absolute -translate-x-1/2 flex items-center gap-1"
            style={{
              top: `${top}%`,
              left: isLeft ? "25%" : "75%",
            }}
          >
            <span className="flex items-center gap-0.5">
              {letters.map((l, idx) => (
                <MiniSlot
                  key={idx}
                  letter={l}
                  index={idx}
                  highlight={isNewest && idx === letters.length - 1}
                />
              ))}
            </span>
          </motion.div>
        );
      })}
    </>
  );
}
