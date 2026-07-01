import { AnimatePresence, motion } from "framer-motion";
import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n";
import { isMuted, setMuted, subscribeMute } from "@/lib/sound";

function useMuted() {
  return useSyncExternalStore(
    subscribeMute,
    () => isMuted(),
    () => false,
  );
}

export function ScoreChip({
  score,
  flash,
}: {
  score: number;
  flash: { id: number; value: number } | null;
}) {
  const t = useT();
  const muted = useMuted();
  return (
    <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
      <button
        onClick={() => setMuted(!muted)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="rounded-md bg-[#F8F0DC] px-2 py-1 font-handwritten text-lg shadow-[2px_2px_0_rgba(58,42,31,0.25)]"
        style={{ border: "1.5px solid #2A1E16" }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <motion.div
        className="relative flex items-baseline gap-1.5 rounded-md bg-[#F8F0DC] px-3 py-1.5 shadow-[2px_2px_0_rgba(58,42,31,0.25)]"
        style={{ border: "1.5px solid #2A1E16", transform: "rotate(1deg)" }}
      >
        <span className="font-handwritten text-2xl text-[#2A1E16] tabular-nums">
          {score.toLocaleString()}
        </span>
        <span className="font-handwritten text-xs uppercase tracking-wider text-[#8B6F4E]">
          {t("pts")}
        </span>
        <AnimatePresence>
          {flash && (
            <motion.div
              key={flash.id}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -24, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="pointer-events-none absolute -top-2 right-0 font-handwritten text-xl text-[#6B8E5A]"
            >
              +{flash.value}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
