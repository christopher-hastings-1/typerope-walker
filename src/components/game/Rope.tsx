import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import {
  balanceToOffsetVw,
  buildRopePath,
  ROPE_CENTER_X,
  vwToRopeUnits,
  walkerSvgY,
} from "@/lib/rope";

export function Rope({
  balance,
  maxBalance,
  walkerProgress,
  shake,
}: {
  balance: number;
  maxBalance: number;
  walkerProgress: number;
  shake: boolean;
}) {
  // Walker x in SVG units, spring-smoothed. Rope lags slightly behind weight.
  const walkerX = useSpring(ROPE_CENTER_X, { stiffness: 70, damping: 15, mass: 1.1 });
  useEffect(() => {
    const vw = balanceToOffsetVw(balance, maxBalance);
    walkerX.set(ROPE_CENTER_X + vwToRopeUnits(vw));
  }, [balance, maxBalance, walkerX]);

  const shakeX = useSpring(0, { stiffness: 600, damping: 8 });
  useEffect(() => {
    if (shake) {
      shakeX.set(8);
      const t = setTimeout(() => shakeX.set(-6), 60);
      const t2 = setTimeout(() => shakeX.set(0), 180);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
  }, [shake, shakeX]);

  const wy = walkerSvgY(walkerProgress);
  const d = useTransform(walkerX, (x) => buildRopePath(x, wy));

  return (
    <motion.svg
      viewBox="0 0 200 1000"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      style={{ x: shakeX }}
      aria-hidden
    >
      <motion.path
        d={d}
        stroke="#2A1E16"
        strokeOpacity={0.15}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        transform="translate(2, 3)"
      />
      <motion.path
        d={d}
        stroke="#3A2A1F"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <motion.path
        d={d}
        stroke="#5A3E2A"
        strokeWidth={1.2}
        strokeDasharray="2 6"
        fill="none"
        opacity={0.6}
      />
    </motion.svg>
  );
}
