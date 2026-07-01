import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useT } from "@/lib/i18n";


function LetterSlot({
  letter,
  kind,
  index,
  big,
}: {
  letter: string;
  kind: "prefix" | "typed" | "empty" | "overflow" | "danger-empty" | "danger";
  index: number;
  big?: boolean;
}) {
  const filled = kind === "prefix" || kind === "typed" || kind === "overflow" || kind === "danger";
  const isPrefix = kind === "prefix";
  const isOverflow = kind === "overflow";
  const isDangerEmpty = kind === "danger-empty";
  const isDanger = kind === "danger";

  const bg = isDanger
    ? "rgba(179,58,31,0.15)"
    : filled && !isOverflow
      ? "#FBF4E4"
      : "transparent";
  const borderColor = isDanger
    ? "#B33A1F"
    : isDangerEmpty
      ? "rgba(179,58,31,0.55)"
      : filled && !isOverflow
        ? "#3A2A1F"
        : "rgba(139,111,78,0.75)";
  const borderStyle = filled && !isOverflow && !isDanger ? "solid" : "dashed";
  const borderWidth = big ? (filled && !isOverflow ? 2 : 2.5) : 1.5;
  const border = `${borderWidth}px ${borderStyle} ${borderColor}`;
  const color = isPrefix
    ? "#D55B3A"
    : isDanger
      ? "#B33A1F"
      : isOverflow
        ? "#8B6F4E"
        : "#2A1E16";
  const shadow =
    filled && !isOverflow && !isDanger
      ? big
        ? "3px 3px 0 rgba(58,42,31,0.22)"
        : "2px 2px 0 rgba(58,42,31,0.18)"
      : "none";

  return (
    <motion.div
      key={`${index}-${kind}-${letter}`}
      initial={filled ? { scale: 0.5, rotate: -8, opacity: 0 } : { opacity: 1 }}
      animate={{
        scale: 1,
        rotate: filled ? (index % 2 === 0 ? -1.5 : 1.5) : 0,
        opacity: isDangerEmpty ? 0.75 : 1,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className="relative flex items-center justify-center font-handwritten uppercase select-none"
      style={{
        width: big ? "3.4rem" : "2.4rem",
        height: big ? "4rem" : "2.8rem",
        borderRadius: big ? "10px" : "6px",
        background: bg,
        border,
        boxShadow: shadow,
        color,
        fontSize: big ? "2.8rem" : "1.9rem",
        lineHeight: 1,
      }}
    >
      {letter}

    </motion.div>
  );
}



export function InputPanel({
  side,
  prefix,
  isWildcard,
  isFreeWord,
  isFirstWord,
  targetLength,
  maxOverflow,
  input,
  onChange,
  onKeyDown,
  inputRef,
  checking,
  shake,
  pairsCompleted,
  total,
}: {
  side: "left" | "right";
  prefix: string;
  isWildcard: boolean;
  isFreeWord: boolean;
  isFirstWord: boolean;
  targetLength: number | null;
  maxOverflow: number;
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  checking: boolean;
  shake: boolean;
  pairsCompleted: number;
  total: number;
}) {
  const sideStyle: React.CSSProperties =
    side === "left"
      ? { right: "6vw", textAlign: "right", alignItems: "flex-end" }
      : { left: "6vw", textAlign: "left", alignItems: "flex-start" };

  const t = useT();
  const caption = isFreeWord
    ? isFirstWord
      ? t("typeAnyWord")
      : t("freeWord")
    : t("nLetterWord", targetLength ?? 0);

  // Build slot list
  const typedLetters = input.toUpperCase().split("");
  const prefixLen = prefix ? 1 : 0;

  type SlotKind = "prefix" | "typed" | "empty" | "overflow" | "danger-empty" | "danger";
  type Slot = { letter: string; kind: SlotKind };
  const slots: Slot[] = [];

  if (prefix) {
    slots.push({ letter: prefix, kind: "prefix" });
  }
  typedLetters.forEach((l) => {
    slots.push({ letter: l, kind: "typed" });
  });

  if (!isFreeWord && targetLength != null) {
    const filledCount = prefixLen + typedLetters.length;
    // Mark overflow / danger on filled slots
    if (filledCount > targetLength) {
      const overflowCount = filledCount - targetLength;
      for (let i = slots.length - overflowCount; i < slots.length; i++) {
        const overshoot = i - (slots.length - overflowCount) + 1; // 1-based position past target
        if (slots[i].kind === "typed") {
          slots[i].kind = overshoot > maxOverflow ? "danger" : "overflow";
        }
      }
    }
    // Fill up to target with neutral empties
    const neutralNeeded = Math.max(0, targetLength - filledCount);
    for (let i = 0; i < neutralNeeded; i++) {
      slots.push({ letter: "", kind: "empty" });
    }
  }



  const rowDirection: React.CSSProperties["flexDirection"] = "row";

  return (
    <>

      <motion.div
        className="absolute top-16 z-20 flex flex-col gap-2"
        style={sideStyle}
        animate={
          shake
            ? { x: [0, -10, 8, -6, 4, 0], rotate: [0, -1, 1, -0.6, 0] }
            : { x: 0, rotate: 0 }
        }
        transition={{ duration: 0.4 }}
      >
        {isFirstWord && (
          <motion.div
            className="font-handwritten text-2xl tracking-wide text-[#3A2A1F]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {caption}
          </motion.div>
        )}

        <motion.div
          className="relative flex items-center gap-1.5 px-4 py-3"
          style={{
            flexDirection: rowDirection,
            justifyContent: side === "left" ? "flex-end" : "flex-start",
            borderRadius: isFirstWord ? "14px" : undefined,
            background: isFirstWord
              ? "radial-gradient(ellipse at center, rgba(213,91,58,0.10), rgba(213,91,58,0) 70%)"
              : undefined,
          }}
          animate={
            isFirstWord && input.length === 0
              ? { scale: [1, 1.03, 1] }
              : { scale: 1 }
          }
          transition={
            isFirstWord && input.length === 0
              ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        >
          {isFirstWord && input.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <LetterSlot
                  key={`ghost-${i}`}
                  letter=""
                  kind="empty"
                  index={i}
                />
              ))
            : slots.map((s, i) => (
                <LetterSlot
                  key={i}
                  letter={s.letter}
                  kind={s.kind}
                  index={i}
                />
              ))}
          {/* invisible input captures keystrokes */}
          <input
            ref={inputRef}
            value={input}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={checking}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            aria-label="Type your word"
            className="absolute inset-0 w-full h-full opacity-0 cursor-default"
          />
        </motion.div>

        {isFirstWord && (
          <motion.div
            className="h-5 font-handwritten text-lg text-[#8B6F4E]"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {checking ? t("checking") : t("pressEnter")}
          </motion.div>
        )}


        <AnimatePresence>
          {shake && (
            <motion.div
              key="splat"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none absolute -top-2 -right-2"
            >
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="6" fill="#B33A1F" opacity="0.8" />
                <circle cx="36" cy="18" r="2.5" fill="#B33A1F" opacity="0.7" />
                <circle cx="14" cy="32" r="3" fill="#B33A1F" opacity="0.7" />
                <circle cx="38" cy="34" r="1.8" fill="#B33A1F" opacity="0.6" />
                <circle cx="12" cy="14" r="2" fill="#B33A1F" opacity="0.5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
