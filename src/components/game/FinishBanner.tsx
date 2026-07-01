import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";
import { walkerTopPct } from "@/lib/rope";

export function FinishBanner() {
  const t = useT();
  // Position the banner just above the walker's landing height at progress = 1.
  const landingTop = walkerTopPct(1); // % from top
  const bannerTop = `calc(${landingTop}% - 92px)`;

  return (
    <div
      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 flex flex-col items-center"
      style={{ top: bannerTop }}
    >
      <motion.div
        initial={{ y: -6, rotate: -3, opacity: 0 }}
        animate={{ y: 0, rotate: -2, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.2 }}
        className="relative"
      >
        {/* String tacks */}
        <div className="absolute -top-3 left-3 h-3 w-[1.5px] rotate-[15deg] bg-[#2A1E16]/60" />
        <div className="absolute -top-3 right-3 h-3 w-[1.5px] -rotate-[15deg] bg-[#2A1E16]/60" />

        {/* Banner body — pennant with notched tails */}
        <svg
          width="180"
          height="70"
          viewBox="0 0 180 70"
          className="drop-shadow-[3px_4px_0_rgba(42,30,22,0.35)]"
        >
          <defs>
            <pattern id="finishStripes" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#E5A23C" />
              <rect width="5" height="10" fill="#D55B3A" />
            </pattern>
          </defs>
          {/* Top stripe strip */}
          <path
            d="M 4 6 L 176 6 L 176 18 L 4 18 Z"
            fill="url(#finishStripes)"
            stroke="#2A1E16"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Main pennant */}
          <path
            d="M 4 18 L 176 18 L 168 44 L 176 62 L 4 62 L 12 44 Z"
            fill="#F8F0DC"
            stroke="#2A1E16"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Fold shadow on left */}
          <path
            d="M 4 18 L 12 44 L 4 62 Z"
            fill="#2A1E16"
            opacity="0.08"
          />
          <text
            x="90"
            y="49"
            textAnchor="middle"
            fontFamily="Caveat, cursive"
            fontSize="32"
            fill="#2A1E16"
            style={{ letterSpacing: "2px" }}
          >
            {t("finishLabel")}
          </text>
        </svg>
      </motion.div>

      {/* Tick marker on the rope where the walker actually lands */}
      <div
        className="mt-1 h-3 w-[3px] rounded-full bg-[#2A1E16]/60"
        style={{ marginTop: 6 }}
      />
    </div>
  );
}
