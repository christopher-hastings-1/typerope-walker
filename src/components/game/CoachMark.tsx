import { AnimatePresence, motion } from "framer-motion";
import { balanceToOffsetVw, walkerTopPct } from "@/lib/rope";

export function CoachMark({
  id,
  text,
  onDismiss,
  balance,
  maxBalance,
  progress,
}: {
  id: string | null;
  text: string;
  onDismiss: () => void;
  balance: number;
  maxBalance: number;
  progress: number;
}) {
  // Walker's feet position, in viewport units
  const feetTopPct = walkerTopPct(progress);
  const offsetVw = balanceToOffsetVw(balance, maxBalance);
  // Place the bubble's bottom (its tail) a bit above the walker's head.
  // Walker sprite is roughly ~11vh tall; leave a small gap above the head.
  const bubbleBottomPct = 100 - feetTopPct + 13;

  return (
    <AnimatePresence mode="wait">
      {id && (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 10, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: -1.2 }}
          exit={{ opacity: 0, y: 6, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="pointer-events-auto absolute z-30 -translate-x-1/2"
          style={{
            left: `calc(50% + ${offsetVw}vw)`,
            bottom: `${bubbleBottomPct}vh`,
          }}
        >
          <div
            className="relative max-w-[min(80vw,380px)] rounded-md bg-[#F8F0DC] px-6 py-4 shadow-[4px_6px_0_#2A1E16]"
            style={{ border: "2px solid #2A1E16" }}
          >
            <p className="font-handwritten text-xl leading-snug text-[#2A1E16]">
              {text}
            </p>
            <button
              onClick={onDismiss}
              aria-label="Dismiss hint"
              className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#2A1E16] font-handwritten text-sm text-[#F8F0DC] shadow-[2px_2px_0_#8B6F4E]"
            >
              ✕
            </button>
            {/* Tail pointing down toward walker */}
            <svg
              width="28"
              height="18"
              viewBox="0 0 28 18"
              className="absolute -bottom-3 left-1/2 -translate-x-1/2"
              aria-hidden
            >
              <path
                d="M 2 0 Q 14 20 26 0"
                fill="#F8F0DC"
                stroke="#2A1E16"
                strokeWidth="2"
              />
              <line x1="3" y1="0" x2="25" y2="0" stroke="#F8F0DC" strokeWidth="3" />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
