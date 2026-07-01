import { motion } from "framer-motion";
import { Leaderboard } from "./Leaderboard";
import { useT } from "@/lib/i18n";

const CONFETTI_COLORS = ["#D55B3A", "#E5A23C", "#6B8E5A", "#3A2A1F", "#F2C9A1"];

function Confetti() {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 1.6 + Math.random() * 1.4;
        const rotate = Math.random() * 720 - 360;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const size = 6 + Math.random() * 8;
        return (
          <motion.div
            key={i}
            initial={{ y: -40, x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: "110vh", rotate, opacity: [1, 1, 0] }}
            transition={{ duration, delay, ease: "easeIn" }}
            className="absolute"
            style={{
              left: `${left}%`,
              top: 0,
              width: size,
              height: size * 0.6,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
}

export function Overlay({
  title,
  subtitle,
  buttonText,
  onClick,
  showConfetti,
  score,
  personalBest,
  isPB,
}: {
  title: string;
  subtitle: string;
  buttonText: string;
  onClick: () => void;
  showConfetti?: boolean;
  score: number;
  personalBest: number;
  isPB: boolean;
}) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto backdrop-blur-sm"
      style={{ background: "rgba(245, 237, 220, 0.7)" }}
    >
      {showConfetti && <Confetti />}
      <motion.div
        initial={{ y: 60, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: -1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="relative my-8 flex flex-col items-center gap-4 rounded-md bg-[#F8F0DC] px-10 py-8 text-center shadow-[0_20px_40px_-15px_rgba(42,30,22,0.4)]"
        style={{ border: "2px solid #2A1E16" }}
      >
        <h1 className="font-handwritten text-5xl text-[#2A1E16]">{title}</h1>
        <p className="max-w-sm font-handwritten text-lg text-[#8B6F4E]">
          {subtitle}
        </p>

        <div className="flex items-baseline gap-3">
          <span className="font-handwritten text-4xl text-[#D55B3A] tabular-nums">
            {score.toLocaleString()}
          </span>
          <span className="font-handwritten text-sm uppercase tracking-wider text-[#8B6F4E]">
            {t("pts")}
          </span>
        </div>

        {!isPB && personalBest > 0 && (
          <div className="font-handwritten text-sm uppercase tracking-wider text-[#8B6F4E]">
            {t("pbLabel")}:{" "}
            <span className="text-[#2A1E16]">
              {personalBest.toLocaleString()}
            </span>
          </div>
        )}

        <Leaderboard score={score} isPB={isPB} />

        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="mt-2 rounded-sm bg-[#D55B3A] px-8 py-3 font-handwritten text-2xl text-[#F8F0DC] shadow-[3px_3px_0_#2A1E16]"
        >
          {buttonText}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
