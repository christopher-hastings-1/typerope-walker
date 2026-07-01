import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/lib/i18n";
import type { Bonus } from "@/lib/score";

export type Popup = {
  id: number;
  points: number;
  bonuses: Bonus[];
};

export function PointsPopupLayer({ popups }: { popups: Popup[] }) {
  const t = useT();
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 z-30 flex justify-center">
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20, scale: 0.7 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, y: -120 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="absolute flex flex-col items-center gap-1"
          >
            <div
              className="rounded-md bg-[#F8F0DC] px-4 py-1 font-handwritten text-3xl text-[#6B8E5A] shadow-[3px_3px_0_rgba(58,42,31,0.3)] tabular-nums"
              style={{ border: "2px solid #2A1E16", transform: "rotate(-2deg)" }}
            >
              +{p.points}
            </div>
            {p.bonuses.map((b, i) => (
              <div
                key={i}
                className="rounded-sm bg-[#E5A23C] px-2 py-0.5 font-handwritten text-sm uppercase tracking-wider text-[#2A1E16] shadow-[2px_2px_0_rgba(58,42,31,0.25)]"
                style={{
                  border: "1.5px solid #2A1E16",
                  transform: `rotate(${i % 2 === 0 ? 1.5 : -1.5}deg)`,
                }}
              >
                {t(b.key, ...((b.args ?? []) as unknown[]))}
              </div>
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
